export class ContactProperties {
  createdate: Date;
  email: string;
  firstname: string;
  hs_object_id: string;
  lastmodifieddate: Date;
  lastname: string;
}

export class HubspotContact {
  id: string;
  properties: ContactProperties;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
}
