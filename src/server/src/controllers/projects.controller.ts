// Todo: Refactor for JOIN queries
// Todo: Add ConsoleLogs||ConsoleDebug and ConsoleErrors to each controller endpoint

import { Router } from 'express';
import { ProjectService } from 'services/projects.services';
import { Request, Response } from 'express';
import { createErrorResponse } from 'utils';

import { SocketMessages } from '../../../types/socket';

import { IoRequest } from 'utils';

const projectsController = (router: Router): void => {
  const projectService = new ProjectService();

  router.get('/projects', async function (req: Request, res: Response) {
    const projects = await projectService.getProjects();
    res.json(projects);
  });

  router.get('/projects/:id', async function (req: Request, res: Response) {
    try {
      const project = await projectService.getProjectById(req.params.id);
      return res.send(project);
    } catch (e) {
      res.status(500);
      return res.send(createErrorResponse(e));
    }
  });

  router.post('/projects', async function (req: Request, res: Response) {
    console.log('Router post project request');
    try {
      const project = await projectService.createProject(req.body);
      return res.send(project);
    } catch (e) {
      console.error(e);
      res.status(500);
      return res.send(createErrorResponse(['Project could not be created.']));
    }
  });

  router.put('/projects/:id', async function (
    req: Request & { io: any; userId: string },
    res: Response
  ) {
    try {
      const updatedProject = await projectService.modifyProject(
        req.body,
        req.params.id
      );
      req.io.emit(SocketMessages.PROJECTS, updatedProject);
      return res.send(updatedProject);
    } catch (e) {
      res.status(500);
      return res.send(createErrorResponse(e));
    }
  });
};

export default projectsController;
