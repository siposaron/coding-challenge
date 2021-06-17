import { HttpModule, HttpService } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { HubspotService } from '../hubspot.service';
describe('Hubspot service', () => {
  let app: TestingModule;
  let hubspotService: HubspotService;
  let httpService: HttpService;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: 'apps/__tests__/test.env',
        }),
        HttpModule,
      ],
      providers: [ConfigService, HubspotService],
    }).compile();
    hubspotService = app.get<HubspotService>(HubspotService);
    httpService = app.get<HttpService>(HttpService);
  });

  it('get search payload with id', async () => {
    const id = '1000';
    const payload = hubspotService.getSearchPayload(id);
    const expected = {
      sorts: [
        {
          propertyName: 'hs_object_id',
          direction: 'ASCENDING',
        },
      ],
      limit: 100,
      filters: [
        {
          propertyName: 'hs_object_id',
          operator: 'GT',
          value: id,
        },
      ],
    };
    expect(payload).toMatchObject(expected);
  });
  it('get search payload without id', async () => {
    const payload = hubspotService.getSearchPayload(null);
    const expected = {
      sorts: [
        {
          propertyName: 'hs_object_id',
          direction: 'ASCENDING',
        },
      ],
      limit: 100,
    };
    expect(payload).toMatchObject(expected);
  });

  it('should not get contacts by id', async () => {
    jest.spyOn(httpService, 'post').mockResolvedValue({} as never);
    const contacts = await hubspotService.getContacts('1');
    expect(contacts).toBeUndefined();
  });

  it('should get contacts by id', async () => {
    jest.spyOn(httpService, 'post').mockReturnValue(
      of({
        data: {
          results: [
            {
              id: '1',
              properties: {
                createdate: '2021-06-13T12:35:03.011Z',
                email: 'emailmaria@hubspot.com',
                firstname: 'Maria',
                hs_object_id: '1',
                lastmodifieddate: '2021-06-13T12:35:03.993Z',
                lastname: 'Johnson (Sample Contact)',
              },
              createdAt: '2021-06-13T12:35:03.011Z',
              updatedAt: '2021-06-13T12:35:03.993Z',
              archived: false,
            },
          ],
        },
        status: 200,
        statusText: 'Ok',
        headers: {
          'Content-Type': 'application/json',
        },
        config: {},
      }),
    );
    const contacts = await hubspotService.getContacts('1');
    const contact = contacts[0];
    expect(contacts.length).toBe(1);
    expect(contact.properties.firstname).toBe('Maria');
    expect(contact.properties.hs_object_id).toBe('1');
    expect(contact.properties.email).toBe('emailmaria@hubspot.com');
  });
});
