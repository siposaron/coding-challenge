import { HttpService, Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { map } from 'rxjs/operators';
import { HubspotContact } from '../../dto/hubspot/hubspot.contact.dto';

const HUBSPOT_CONTACTS_SEARCH_URI =
  'https://api.hubapi.com/crm/v3/objects/contacts/search';

/**
 * The Hubspot service responsible for fetching the contacts data.
 */
@Injectable()
export class HubspotService {
  private readonly logger = new Logger(HubspotService.name);

  private uri = '';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.uri = HUBSPOT_CONTACTS_SEARCH_URI.concat(
      '?hapikey=',
      this.configService.get<string>('HUBSPOT_API_KEY'),
    );
  }

  /**
   * Retrieves the contacts from Hubspot
   *
   * @param fromDate optional date for setting the lastmodifieddate contacts are retrieved starting from
   * @returns HubspotContact list
   */
  async getContacts(fromDate?: Date): Promise<HubspotContact[]> {
    try {
      const payload = this.getSearchPayload(fromDate);
      this.logger.debug(`Fetch payload ${JSON.stringify(payload)}`);

      return await this.httpService
        .post(this.uri, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .pipe(map((response) => response.data.results as HubspotContact[]))
        .toPromise();
    } catch (e) {
      this.logger.error(`Could not fetch data from hubspot. ${e.message}`);
    }
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
