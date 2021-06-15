import { HttpService, Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HubspotContact } from '../../dto/hubspot/hubspot.contact.dto';

const HUBSPOT_CONTACTS_SEARCH_URI =
  'https://api.hubapi.com/crm/v3/objects/contacts/search';

/**
 * The Hubspot service responsible for fetching the contacts data.
 */
@Injectable()
export class HubspotService {
  private readonly logger = new Logger(HubspotService.name);

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
  async getContacts(fromDate?: Date): Promise<HubspotContact[]> {
    try {
      const payload = this.getSearchPayload(fromDate);
      const searchUri = HUBSPOT_CONTACTS_SEARCH_URI.concat(
        '?hapikey=',
        this.configService.get<string>('HUBSPOT_API_KEY'),
      );
      this.logger.debug(
        `Fetch payload ${JSON.stringify(payload)} \ searchUri: ${searchUri}`,
      );

      return await this.httpService
        .post(searchUri, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .pipe(map((response) => response.data as HubspotContact[]))
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
