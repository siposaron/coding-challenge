import { ContactDto } from '../contact.dto';

export const contactDtoMock1 = {
  id: '1000',
  firstName: 'Jason',
  lastName: 'Stathamm',
  email: 'json@stathamm.st',
  createDate: new Date(),
  modifyDate: new Date(),
} as ContactDto;

export const generateContactDtoMocks = (): ContactDto[] => {
  const contacts = [...Array(100).keys()].map((index) => {
    return {
      id: `${index}`,
      firstName: `Jason ${index}`,
      lastName: `Stathamm ${index}`,
      email: `json${index}@stathamm.st`,
      createDate: new Date(),
      modifyDate: new Date(),
    } as ContactDto;
  });

  contacts.push(contactDtoMock1);
  return contacts;
};
