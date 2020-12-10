import React from 'react';

import Select, { SelectItem } from 'elements/Select';
import { TaskPriority, TaskType, TaskStatus, Task } from 'types/task';

import { createTask, updateTask } from 'store/actions';

import {
  useNotificationSnackbar,
  NotificationSeverity,
} from 'hooks/notification';

import { Alert } from '@material-ui/lab';

import { isNotFilledOut, isTooLong, trimState } from 'utils/index';

import {
  DialogTitle,
  Dialog,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Button,
  styled,
} from '@material-ui/core';

// import { KeyboardDatePicker } from '@material-ui/pickers';
import DateTimePicker from 'elements/DateTimePicker';

import { useForm } from 'hooks/form';

const TextFieldWrapper = styled('div')(() => {
  return {
    margin: '1rem 0',
    width: '40rem',
    display: 'flex',
    justifyContent: 'space-between',
  };
});

const SelectWrapper = styled('div')(() => {
  return {
    marginRight: '1rem',
    width: '10rem',
  };
});

const SelectContainer = styled('div')((props: any) => {
  return {
    display: 'flex',
    justifyContent: 'flex-start',
  };
});

export interface TaskDialogProps {
  open: boolean;
  onClose: () => void;
  clearTasksCache: () => void;
  dialogTask: Task | null;
}

export interface TaskDialogState {
  name: string;
  summary: string;
  description: string;
  taskType: TaskType;
  taskStatus: TaskStatus;
  taskPriority: TaskPriority;
  deadline?: Date | string | null;
}

export enum TaskDialogAction {
  SET_NAME = 'setName',
  SET_SUMMARY = 'setSummary',
  SET_DESCRIPTION = 'setDescription',
  SET_TASKTYPE = 'setTaskType',
  SET_TASKSTATUS = 'setTaskStatus',
  SET_TASKPRIORITY = 'setTaskPriority',
  SET_DEADLINE = 'setDeadline',
  RESET_STATE = 'setState',
}

export interface ITaskDialogActions {
  type: string;
  payload?: any;
}

const mapEnumToSelectItems = (
  set: typeof TaskPriority | typeof TaskType | typeof TaskStatus
): SelectItem<string>[] => {
  return Object.keys(set).map(key => {
    return { label: set[key], value: set[key] };
  });
};

const taskToDialogState = (task: Task | null): TaskDialogState | null => {
  if (task) {
    const {
      name,
      summary,
      description,
      type: taskType,
      status: taskStatus,
      priority: taskPriority,
      deadline,
    } = task;
    return {
      name,
      summary,
      description,
      taskType,
      taskStatus,
      taskPriority,
      deadline,
    };
  }
  return null;
};

const TaskDialog = (props: TaskDialogProps): JSX.Element => {
  const initialState = taskToDialogState(props.dialogTask) || {
    name: '',
    summary: '',
    description: '',
    taskType: TaskType.FEATURE,
    taskStatus: TaskStatus.BACKLOG,
    taskPriority: TaskPriority.MEDIUM,
    deadline: new Date(
      new Date().getTime() + 24 * 60 * 60 * 1000
    ).toISOString(), // defaults to tomorrow
  };

  const addingTask = taskToDialogState(props.dialogTask) ? false : true;

  const { state, submit, reset, errors, triedSubmit, dispatch } = useForm({
    initialState,
    reducer: (
      state: TaskDialogState,
      action: ITaskDialogActions
    ): TaskDialogState => {
      // const { type }: TaskDialogAction = action;
      let newState = { ...state };
      console.log('newState:', newState);
      switch (action.type) {
        case TaskDialogAction.SET_NAME:
          newState.name = action.payload;
          break;
        case TaskDialogAction.SET_SUMMARY:
          newState.summary = action.payload;
          break;
        case TaskDialogAction.SET_DESCRIPTION:
          newState.description = action.payload;
          break;
        case TaskDialogAction.SET_TASKTYPE:
          newState.taskType = action.payload;
          break;
        case TaskDialogAction.SET_TASKSTATUS:
          newState.taskStatus = action.payload;
          break;
        case TaskDialogAction.SET_TASKPRIORITY:
          newState.taskPriority = action.payload;
          break;
        case TaskDialogAction.SET_DEADLINE:
          newState.deadline = action.payload;
          break;
        case TaskDialogAction.RESET_STATE:
          newState = initialState;
          break;
      }
      return newState;
    },
    validateState: (
      state: TaskDialogState
    ): undefined | Record<string, string> => {
      const errors: Record<string, string> = {};
      const vState = { ...state };

      trimState(vState);

      if (isNotFilledOut(vState.name)) {
        errors.name = 'A name must be provided.';
      }
      if (isNotFilledOut(vState.description)) {
        errors.description = 'A description must be provided.';
      }
      if (isTooLong(vState.name, 180)) {
        errors.name = 'A name cannot be longer than 180 characters.';
      }
      if (isTooLong(vState.description, 5000)) {
        errors.description =
          'A description cannot be longer than 5000 characters.';
      }
      return Object.keys(errors).length ? errors : undefined;
    },
    onSubmit: async () => {
      if (errors) {
        showNotification(
          "Task doesn't meet requirements.",
          NotificationSeverity.ERROR
        );
        return;
      }

      trimState(state);

      console.log('DialogTask:', props.dialogTask);

      const task = addingTask
        ? await createTask({
            name: state.name,
            summary: state.summary,
            description: state.description,
            type: state.taskType,
            priority: state.taskPriority,
            status: state.taskStatus,
            deadline: state.deadline as string,
          })
        : updateTask((props.dialogTask as Task).id, {
            ...(props.dialogTask as Task),
            name: state.name,
            summary: state.summary,
            description: state.description,
            type: state.taskType,
            priority: state.taskPriority,
            status: state.taskStatus,
            deadline: state.deadline as string,
          });
      if (task) {
        showNotification(
          `Task ${addingTask ? 'created' : 'edited'} successfully!`,
          NotificationSeverity.SUCCESS
        );
        handleClose();
        clearTasksCache(); // Suboptimal; task should be added to cache instead of being refetched
      } else {
        showNotification('User creation failed!', NotificationSeverity.ERROR);
      }
    },
  });

  const { open, onClose, clearTasksCache } = props;

  const [snackbar, showNotification] = useNotificationSnackbar();

  // Redo: Action is function that is passed dispatch and a payload

  const handleClose = () => {
    reset();
    onClose();
  };

  console.log('state:', state);

  return (
    <>
      {snackbar}
      <Dialog
        maxWidth="lg"
        aria-labelledby="simple-dialog-title"
        open={open}
        onClose={handleClose}
      >
        <DialogTitle id="task-dialog-title">
          {addingTask ? 'Add' : 'Edit'} Task
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {addingTask ? 'Add a task to' : 'Edit a task in'} the database
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Task Name"
            type="text"
            fullWidth
            value={state.name}
            onChange={e => {
              dispatch({
                type: TaskDialogAction.SET_NAME,
                payload: e.target.value,
              });
            }}
          />
          <TextField
            margin="dense"
            id="summary"
            label="Task Summary"
            type="text"
            fullWidth
            value={state.summary}
            onChange={e => {
              dispatch({
                type: TaskDialogAction.SET_SUMMARY,
                payload: e.target.value,
              });
            }}
          />
          <TextFieldWrapper>
            <TextField
              margin="dense"
              id="description"
              label="Task Description"
              type="text"
              multiline={true}
              variant="outlined"
              rows={8}
              fullWidth
              value={state.description}
              onChange={e => {
                dispatch({
                  type: TaskDialogAction.SET_DESCRIPTION,
                  payload: e.target.value,
                });
              }}
            />
          </TextFieldWrapper>
          <SelectContainer>
            <SelectWrapper>
              <Select
                fullWidth
                title={'Task Priority'}
                items={mapEnumToSelectItems(TaskPriority)}
                onChange={e => {
                  dispatch({
                    type: TaskDialogAction.SET_TASKPRIORITY,
                    payload: e.target.value,
                  });
                }}
                value={state.taskPriority}
              />
            </SelectWrapper>
            <SelectWrapper>
              <Select
                fullWidth
                title={'Task Type'}
                items={mapEnumToSelectItems(TaskType)}
                onChange={e => {
                  dispatch({
                    type: TaskDialogAction.SET_TASKTYPE,
                    payload: e.target.value,
                  });
                }}
                value={state.taskType}
              />
            </SelectWrapper>
            <SelectWrapper>
              <Select
                fullWidth
                title={'Task Status'}
                items={mapEnumToSelectItems(TaskStatus)}
                onChange={e => {
                  dispatch({
                    type: TaskDialogAction.SET_TASKSTATUS,
                    payload: e.target.value,
                  });
                }}
                value={state.taskStatus}
              />
            </SelectWrapper>
          </SelectContainer>
          <DateTimePicker
            value={state.deadline as string}
            onChange={value =>
              dispatch({
                type: TaskDialogAction.SET_DEADLINE,
                payload: value,
              })
            }
          />
        </DialogContent>
        {triedSubmit && errors ? (
          <DialogContent>
            {Object.values(errors).map((errorMessage, index) => {
              return (
                <Alert severity="error" key={index}>
                  {errorMessage}
                </Alert>
              );
            })}
          </DialogContent>
        ) : null}
        <DialogActions>
          <Button variant="contained" onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button variant="contained" onClick={submit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TaskDialog;
