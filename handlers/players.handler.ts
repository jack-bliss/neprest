import { NepHandler } from '../neprest/NepHandler';
import { NepMethod } from '../neprest/NepMethod';
import { NepDeleteRequest, NepGetRequest, NepPostRequest } from '../neprest/NepRequest';

export class Player {
  id: number;
  tag: string;
  rank: number;
  tier: number;

  constructor(input: Partial<Player>) {
    Object.assign(this, input);
  }
  
}

@NepHandler({
  table: 'players',
  schema: Player,
})
export class PlayersHandler {
  
  @NepMethod({
    method: 'get',
    queryParams: ['tag']
  })
  getPlayers(params, queryParams): NepGetRequest<Player[]> {
    return new NepGetRequest<Player[]>({
      select: '*',
      where: queryParams.tag ? 'tag LIKE ' + queryParams.tag : null,
    });
  }
  
  @NepMethod({
    method: 'post',
  })
  addPlayer(params, body): NepPostRequest<Player> {
    return new NepPostRequest<Player>({
      insert: new Player(body.player),
      returning: '*',
    });
  }
  
  @NepMethod({
    method: 'get',
    params: ['id']
  })
  getPlayerById(params, queryParams): NepGetRequest<Player> {
    return new NepGetRequest<Player>({
      select: ['*'],
      where: 'id=' + params.id,
      prep: (players: Player[]): Player => {
        if (players) {
          return players[0];
        } else {
          return null;
        }
      }
    });
  }
  
  @NepMethod({
    method: 'delete',
    params: ['id']
  })
  deletePlayer(params): NepDeleteRequest<Player> {
    return new NepDeleteRequest<Player>({
      where: 'id=' + params.id,
    });
  }
  
}