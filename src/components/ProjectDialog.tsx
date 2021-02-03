import React from 'react';

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

// import { Alert } from '@material-ui/lab';

// import Select from 'elements/Select';
import DateTimePicker from 'elements/DateTimePicker';

import { Person } from 'types/person';

import { createProject } from 'store/actions';

// import { reRenderApp } from 'App';

import { isNotFilledOut, isTooLong, trimState } from 'utils/index';

import {
  useNotificationSnackbar,
  NotificationSeverity,
} from 'hooks/notification';

import { useForm } from 'hooks/form';

import { NewProject } from 'types/project';

import { useGetPersonnel } from 'hooks/axiosHooks';

import TransferList from 'components/PersonnelTransferList';
import LoadingSpinner from 'elements/LoadingSpinner';

import { FormAction } from 'hooks/form';

const TrimmedDialogTitle = styled(DialogTitle)(() => {
  return {
    paddingBottom: '0rem',
  };
});

const TrimmedDialogContent = styled(DialogContent)(() => {
  return {
    paddingBottom: '0rem',
    paddingTop: '0rem',
  };
});

interface ProjectDialogState {
  title: string;
  description: string;
  availablePersonnel: Person[];
  assignedPersonnel: Person[];
  deadline: Date | string | null;
}

interface ProjectDialogProps {
  // project: Project | null;
  showingDialog: boolean;
  hideDialog: () => void;
}

// interface IProjectDialogAction {
//   type: string;
//   payload?: any;
// }

export enum ProjectDialogAction {
  SET_TITLE = 'setTitle',
  SET_DESCRIPTION = 'setDescription',
  SET_AVAILABLE_PERSONNEL = 'setAvailablePersonnel',
  SET_ASSIGNED_PERSONNEL = 'setAssignedPersonnel',
  SET_DEADLINE = 'setDeadline',
}

// S/N: Personnel need an additional property--selected--that will determine if their column changes on arrow click
const ProjectDialog = (props: ProjectDialogProps): JSX.Element => {
  const initialState: ProjectDialogState = {
    title: '',
    description: '',
    availablePersonnel: [],
    assignedPersonnel: [],
    deadline: new Date(
      new Date().getTime() + 24 * 60 * 60 * 1000
    ).toISOString(), // defaults to tomorrow,
  };

  const assignedPersonnel: Person[] = [];

  const getAssignedPersonnel = () => {
    return assignedPersonnel;
  };

  const setAssignedPersonnel = (newArr: Person[]): void => {
    const assignedPersonnel = getAssignedPersonnel();
    assignedPersonnel.splice(0, assignedPersonnel.length).concat(newArr);
  };

  const {
    loading: personnelLoading,
    data: personnelData,
    error: personnelError,
  } = useGetPersonnel();

  console.log('PersonnelData:', personnelData);

  const { state, submit, reset, errors, triedSubmit, dispatch } = useForm({
    initialState,
    reducer: (
      state: ProjectDialogState,
      action: FormAction
    ): ProjectDialogState => {
      const newState = { ...state };
      switch (action.type) {
        case ProjectDialogAction.SET_TITLE:
          newState.title = action.payload;
          break;
        case ProjectDialogAction.SET_DESCRIPTION:
          newState.description = action.payload;
          break;
        case ProjectDialogAction.SET_AVAILABLE_PERSONNEL:
          newState.availablePersonnel = action.payload;
          break;
        case ProjectDialogAction.SET_ASSIGNED_PERSONNEL:
          newState.assignedPersonnel = action.payload;
          break;
        case ProjectDialogAction.SET_DEADLINE:
          newState.deadline = action.payload;
          break;
      }
      return newState;
    },
    validateState: (
      state: ProjectDialogState
    ): undefined | Record<string, string> => {
      const errors: Record<string, string> = {};
      const vState = { ...state };

      trimState(vState);

      if (isNotFilledOut(vState.title)) {
        errors.title = 'A title must be provided';
      }
      if (isTooLong(vState.title, 180)) {
        errors.title = 'A title cannot be longer than 180 characters';
      }
      if (isNotFilledOut(vState.description)) {
        errors.description = 'A description must be provided';
      }
      if (isTooLong(vState.description, 180)) {
        errors.description =
          'A description cannot be longer than 180 characters';
      }
      if (assignedPersonnel.length === 0) {
        errors.personnel = 'Personnel must be assigned';
      }
      // ...
      return Object.keys(errors).length ? errors : undefined;
    },
    onSubmit: async () => {
      if (errors) {
        showNotification(
          'Project does not meet requirements',
          NotificationSeverity.ERROR
        );
        return;
      }

      trimState(state);

      const projectToSubmit: NewProject = {
        title: state.title,
        description: state.description,
        personnel: getAssignedPersonnel(),
        deadline: state.deadline,
      };

      const project = await createProject(projectToSubmit);

      if (project) {
        showNotification('Project created', NotificationSeverity.SUCCESS);
        handleClose();
      }
    },
  });

  const [snackbar, showNotification] = useNotificationSnackbar();

  const handleClose = () => {
    reset();
    props.hideDialog();
  };

  return (
    <>
      {snackbar}
      <Dialog
        maxWidth="md"
        fullWidth
        open={props.showingDialog}
        onClose={handleClose}
      >
        <div>
          <TrimmedDialogTitle>Create New Project</TrimmedDialogTitle>
          <TrimmedDialogContent>
            <DialogContentText>Start a new endeavor</DialogContentText>
          </TrimmedDialogContent>
        </div>
        <TrimmedDialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="project-name"
            label="Name Your Project..."
            value={state.title}
            type="text"
            onChange={e => {
              dispatch({
                type: ProjectDialogAction.SET_TITLE,
                payload: e.target.value,
              });
            }}
            fullWidth
          />
          <TextField
            margin="dense"
            value={state.description}
            label="Describe your project..."
            variant="outlined"
            fullWidth
            multiline={true}
            rows={5}
            onChange={e => {
              dispatch({
                type: ProjectDialogAction.SET_DESCRIPTION,
                payload: e.target.value,
              });
            }}
          />
          {personnelLoading ? (
            <LoadingSpinner />
          ) : personnelData?.length ? (
            <TransferList
              inputList={personnelData}
              setPersonnel={setAssignedPersonnel}
            />
          ) : (
            <div>There are no personnel</div>
          )}
          <DateTimePicker
            value={state.deadline as string}
            onChange={value =>
              dispatch({
                type: ProjectDialogAction.SET_DEADLINE,
                payload: value,
              })
            }
          />
        </TrimmedDialogContent>
        {/* {triedSubmit && errors ? (
          <DialogContent>
            {Object.values(errors).map((errorMessage, index) => {
              return (
                <Alert severity="error" key={index}>
                  {errorMessage}
                </Alert>
              );
            })}
          </DialogContent>
        ) : null} */}
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

export default ProjectDialog;
