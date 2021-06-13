/* eslint-disable @typescript-eslint/no-var-requires */
const xl = require('excel4node');

const NUMBER_OF_RECORDS = 10000;

const HEADERS_COMPANY = ['Name', 'Company domain name', 'Phone Number', 'City'];
const HEADERS_CONTACT = [
  'First Name',
  'Last Name',
  'Email Address',
  'Favorite Food',
  'Mobile phone number',
];

interface Company {
  name: string;
  companyDomainName: string;
  phoneNumber: string;
  city: string;
}

interface Contact {
  firstName: string;
  lastName: string;
  email: string;
  favoriteFood: string;
  phoneNumber: string;
}

const generateCompanies = (): Company[] => {
  const companies: Company[] = [];

  for (let i = 1; i <= NUMBER_OF_RECORDS; i++) {
    const index = '' + i;
    companies.push({
      name: 'Company '.concat(index),
      companyDomainName: 'mydomain'.concat(index).concat('.com'),
      phoneNumber: '111-'.concat(index.padStart(6, '0')),
      city: 'City '.concat(index),
    } as Company);
  }

  return companies;
};

const generateContacts = (): Contact[] => {
  const contacts: Contact[] = [];

  for (let i = 1; i <= NUMBER_OF_RECORDS; i++) {
    const index = '' + i;
    contacts.push({
      firstName: 'Charles',
      lastName: 'Xavier'.concat(index),
      email: 'contact'.concat(index).concat('@xavier.com'),
      phoneNumber: '111-'.concat(index.padStart(6, '0')),
      favoriteFood: 'Coffee',
    } as Contact);
  }

  return contacts;
};

const companiesToXlsx = async () => {
  const companies = generateCompanies();

  const wb = new xl.Workbook();
  const ws = wb.addWorksheet('Companies');
  const style = wb.createStyle({
    font: {
      color: '#000000',
      size: 10,
    },
  });

  for (let i = 0; i < HEADERS_COMPANY.length; i++) {
    ws.cell(1, i + 1)
      .string(HEADERS_COMPANY[i])
      .style(style);
  }

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    ws.cell(i + 2, 1)
      .string(company.name)
      .style(style);
    ws.cell(i + 2, 2)
      .string(company.companyDomainName)
      .style(style);
    ws.cell(i + 2, 3)
      .string(company.phoneNumber)
      .style(style);
    ws.cell(i + 2, 4)
      .string(company.city)
      .style(style);
  }
  wb.write('Companies.xlsx');
};

const contactsToXlsx = async () => {
  const contacts = generateContacts();

  const wb = new xl.Workbook();
  const ws = wb.addWorksheet('Contacts');
  const style = wb.createStyle({
    font: {
      color: '#000000',
      size: 10,
    },
  });

  for (let i = 0; i < HEADERS_CONTACT.length; i++) {
    ws.cell(1, i + 1)
      .string(HEADERS_CONTACT[i])
      .style(style);
  }

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    ws.cell(i + 2, 1)
      .string(contact.firstName)
      .style(style);
    ws.cell(i + 2, 2)
      .string(contact.lastName)
      .style(style);
    ws.cell(i + 2, 3)
      .string(contact.email)
      .style(style);
    ws.cell(i + 2, 4)
      .string(contact.favoriteFood)
      .style(style);
    ws.cell(i + 2, 5)
      .string(contact.phoneNumber)
      .style(style);
  }
  wb.write('Contacts.xlsx');
};

companiesToXlsx();
contactsToXlsx();
