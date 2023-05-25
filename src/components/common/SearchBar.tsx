import React, { useState } from 'react'
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { useDispatch } from 'react-redux'
import { searchByName } from '../recruitment/searchNameSlice'
import type { RootState } from '~/store/store'

const SearchBar = () => {
  const dispatch = useDispatch()

  return (
    <InputGroup
      minWidth={'150px'}
      maxWidth={'300px'}
      position="absolute"
      top={{ lg: '0' }}
      right={{ lg: '12', base: '0' }}
      left={{ lg: 'unset', base: '0' }}
      marginTop={{ lg: 'unset', base: '5' }}
      marginLeft={{ base: 'auto' }}
      marginRight={{ base: 'auto' }}
    >
      <InputLeftElement>
        <SearchIcon />
      </InputLeftElement>
      <Input
        placeholder="Search"
        borderWidth="3px"
        onChange={(e) => dispatch(searchByName(e.target.value))}
        border="3px solid #004586"
        borderColor="#004586"
        borderRadius="20px"
      ></Input>
    </InputGroup>
  )
}

export default SearchBar
