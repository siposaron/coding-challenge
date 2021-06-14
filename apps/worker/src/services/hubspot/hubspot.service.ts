import { HttpService } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HubspotContact } from '../../dto/hubspot/hubspot.contact.dto';

const HUBSPOT_CONTACTS_SEARCH_URI =
  'https://api.hubapi.com/crm/v3/objects/contacts/search';

/**
 * The Hubspot service responsible for fetching the contacts data.
 */
@Injectable()
export class HubspotService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Retrieves the contacts from Hubspot
   *
   * @param fromDate optional date for setting the lastmodifieddate contacts are retrieved starting from
   * @returns HubspotContact list
   */
  getContacts(fromDate?: Date): Observable<HubspotContact[]> {
    return this.httpService
      .post(
        HUBSPOT_CONTACTS_SEARCH_URI.concat(
          '?hapikey=',
          this.configService.get<string>('HUBSPOT_API_KEY'),
        ),
        this.getSearchPayload(fromDate),
      )
      .pipe(map((response) => response.data as HubspotContact[]));
  }

  /**
   * Filter payload, orders the contacts by lastmodifieddate ASC.
   *
   * @param fromDate is the starting lastmodifieddate contacts are retrieved from
   * @returns payload
   */
  getSearchPayload(fromDate: Date) {
    const data = {
      sorts: [
        {
          propertyName: 'lastmodifieddate',
          direction: 'ASCENDING',
        },
      ],
      limit: 100,
    };

    return fromDate
      ? {
          ...data,
          ...{
            filters: [
              {
                propertyName: 'lastmodifieddate',
                operator: 'GTE',
                value: fromDate.getTime(),
              },
            ],
          },
        }
      : data;
  }
}
