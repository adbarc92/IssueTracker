// Todo: modify castTask to include comments

import { PersonEntity } from 'entity/Person';
import { TaskEntity } from 'entity/Task';
import { ProjectEntity } from 'entity/Project';
import { UserEntity } from 'entity/User';
import { UpdateItemEntity } from 'entity/UpdateItem';
import { SubscriptionEntity } from 'entity/Subscription';

import {
  ClientComment,
  commentEntityWithPersonEntity,
} from '../../types/comment';
import { Person as IPerson } from '../../types/person';
import { ClientProject as IProject } from '../../types/project';
import { ClientSubscription } from '../../types/subscription';
import { ClientTask, CommentedTask } from '../../types/task';
import { ClientUpdateItem } from '../../types/updateItem';
import { ClientUser } from '../../types/user';

import { camelCasify, getSubscriptionItemName } from 'utils';

// *** Object copying: Spread first, then overwrite

export const castTask = (task: TaskEntity): ClientTask => {
  return camelCasify({ ...task, typeName: 'Task' });
};

// Todo: refactor to shorten
export const castCommentedTask = (task: CommentedTask): ClientTask => {
  const comments = task.comments.map(comment => castPersonedComment(comment));

  const camelTask: ClientTask = camelCasify(task);

  return { ...camelTask, typeName: 'Task', comments };
};

export const castCommentTask = (task: TaskEntity): CommentedTask => {
  return { ...task, comments: [] };
};

export const castPersonedComment = (
  comment: commentEntityWithPersonEntity
): ClientComment => {
  // const commenter = castPerson(comment.commenter);
  const clientComment: ClientComment = camelCasify(comment);
  // clientComment.commenter = commenter;

  return clientComment;
};

// export const castPersonComment = (
//   comment: CommentEntity,
//   commenter: PersonEntity
// ): commentEntityWithPersonEntity => {
//   return { ...comment, commenter: castPerson(commenter) };
// };

export const castPerson = (person: PersonEntity): IPerson => {
  return camelCasify({ ...person });
};

export const castUser = (user: UserEntity): ClientUser => {
  return camelCasify({ ...user });
};

export const fixProject = (
  project: ProjectEntity,
  tasks: TaskEntity[],
  people: PersonEntity[]
): IProject => {
  return camelCasify({
    ...project,
    tasks,
    people,
  });
};

export const castProject = (project: ProjectEntity): IProject => {
  return camelCasify({ ...project });
};

export const castUpdateItem = (
  updateItem: UpdateItemEntity
): ClientUpdateItem => {
  return camelCasify({ ...updateItem });
};

// Todo: UpdateItem Bundler

export const castSubscription = async (
  subscription: SubscriptionEntity
): Promise<ClientSubscription> => {
  const subItemName = await getSubscriptionItemName(subscription);
  return camelCasify({
    ...subscription,
    subscribedItemName: subItemName,
  });
};
