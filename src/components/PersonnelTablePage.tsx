import React from 'react';
import { useGetPersonnel } from 'hooks/axiosHooks';
import LoadingSpinner from 'elements/LoadingSpinner';
import PersonnelDialog from 'components/PersonnelDialog';
import { Person } from 'types/person';

import AddButton from 'elements/AddButton';

import PersonnelTable from 'components/PersonnelTable';
import PageTitle from 'elements/PageTitle';
import RootWrapper from 'elements/RootWrapper';

const PersonnelTablePage = (): JSX.Element => {
  const {
    loading,
    data: personnelData,
    error,
    clearCache: clearPersonnelCache,
  } = useGetPersonnel();

  const [addingUser, setAddingUser] = React.useState(false);
  const [dialogPerson, setDialogPerson] = React.useState<Person | null>(null);

  const handleOpen = () => {
    setAddingUser(true);
  };

  const closeDialog = () => {
    setAddingUser(false);
    setDialogPerson(null);
  };

  if (error) {
    return <div>There was an error: {error}</div>;
  }

  return (
    <RootWrapper>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <PageTitle
            title={'Personnel'}
            headerElem={
              <AddButton title={'Add Personnel'} handleClick={handleOpen} />
            }
          />
          <PersonnelTable
            personnelData={personnelData as Person[]}
            setDialogPerson={setDialogPerson}
            openDialog={handleOpen}
          />
          <PersonnelDialog
            person={dialogPerson}
            selectedValue={'none'}
            open={addingUser}
            onClose={closeDialog}
            clearPersonnelCache={clearPersonnelCache}
          />
        </>
      )}
    </RootWrapper>
  );
};

export default PersonnelTablePage;
