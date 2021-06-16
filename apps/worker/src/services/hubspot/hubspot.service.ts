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
   * @param id optional id for setting the hs_object_id contacts are retrieved starting from
   * @returns HubspotContact list
   */
  async getContacts(id?: string): Promise<HubspotContact[]> {
    try {
      const payload = this.getSearchPayload(id);
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
   * Filter payload, orders the contacts by hs_object_id ASC.
   *
   * @param id is the starting hs_object_id contacts are retrieved from
   * @returns payload
   */
  getSearchPayload(id: string) {
    const data = {
      sorts: [
        {
          propertyName: 'hs_object_id',
          direction: 'ASCENDING',
        },
      ],
      limit: 100,
    };

    return id
      ? {
          ...data,
          ...{
            filters: [
              {
                propertyName: 'hs_object_id',
                operator: 'GT',
                value: id,
              },
            ],
          },
        }
      : data;
  }
}
