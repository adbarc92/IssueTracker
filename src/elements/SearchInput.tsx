// Todo: Styling properties should be standardized in theme
import React from 'react';
import Input from '@material-ui/core/OutlinedInput';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import { colors } from 'theme';

interface InputProps {
  value?: string;
  placeholder?: string;
  onChange: (ev?: React.SyntheticEvent) => void;
  showSearchIcon?: boolean;
}

const SearchInput = (props: InputProps): JSX.Element => {
  const { value, placeholder, onChange } = props;
  return (
    <Input
      style={{
        maxHeight: '32px',
        marginTop: '1px',
        maxWidth: '250px',
        color: colors.white,
      }}
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      startAdornment={
        <InputAdornment position="start">
          <SearchIcon />
        </InputAdornment>
      }
    ></Input>
  );
};

export default SearchInput;
