import React from 'react';
import { Grid, Paper } from '@material-ui/core';
import { getUser, getUsers } from 'hooks/axiosGet';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import LoadingSpinner from 'elements/LoadingSpinner';
import { useGetData } from 'hooks/useDataLoader';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
  })
);

const Dashboard = (): JSX.Element => {
  const classes = useStyles();

  const { loading, data: users, error } = useGetData(getUsers);

  if (error) {
    return <div>There was an error: {error}</div>;
  }

  return (
    <div className={classes.root}>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Grid container spacing={6}>
          {['Project', 'Ticket', 'Users', 'Activity'].map((text, index) => (
            <Grid key={index} item xs={6}>
              <Paper className={classes.paper}>{text} Preview</Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
};

export default Dashboard;
