import type * as Party from 'partykit/server'
import type { ClientMessage, ServerMessage, RoomSyncState } from './protocol'
import {
  createEmptyState,
  handleJoin,
  handleStartRound,
  handleGuess,
  handleJudgeResult,
  handlePlayAgain,
} from './logic'

export default class OneShotServer implements Party.Server {
  readonly options = { hibernate: true }

  private state: RoomSyncState = createEmptyState()
  private guessA: string | null = null
  private guessB: string | null = null

  constructor(readonly room: Party.Room) {}

  async onStart(): Promise<void> {
    const stored = await this.room.storage.get<RoomSyncState>('state')
    if (stored) {
      this.state = stored
    }
  }

  getConnectionTags(
    _connection: Party.Connection,
    ctx: Party.ConnectionContext
  ): string[] {
    const url = new URL(ctx.request.url)
    const role = url.searchParams.get('role') ?? 'guest'
    return [role]
  }

  async onConnect(
    connection: Party.Connection,
    ctx: Party.ConnectionContext
  ): Promise<void> {
    const url = new URL(ctx.request.url)
    const role = url.searchParams.get('role') as 'host' | 'guest'
    connection.setState({ role })

    connection.send(JSON.stringify({
      type: 'room_state',
      state: this.state,
    } satisfies ServerMessage))

    this.broadcast(
      { type: 'opponent_reconnected' },
      [connection.id]
    )
  }

  async onMessage(
    message: string | ArrayBuffer,
    sender: Party.Connection
  ): Promise<void> {
    if (typeof message !== 'string') return

    const msg: ClientMessage = JSON.parse(message)
    const role = this.getRole(sender)

    switch (msg.type) {
      case 'join': {
        const result = handleJoin(this.state, role)
        this.state = result.state
        await this.saveState()
        this.broadcastAll(result.messages)
        break
      }

      case 'start_round': {
        const result = handleStartRound(this.state, role, msg.round, msg.params)
        this.state = result.state
        this.guessA = null
        this.guessB = null
        await this.saveState()
        this.broadcastAll(result.messages)
        break
      }

      case 'submit_guess': {
        const result = handleGuess(
          this.state, role, msg.guess,
          this.guessA, this.guessB
        )
        this.state = result.state
        this.guessA = result.guessA
        this.guessB = result.guessB
        await this.saveState()
        this.broadcastAll(result.messages)
        break
      }

      case 'judge_result': {
        const result = handleJudgeResult(
          this.state, role, msg.result,
          this.guessA ?? '', this.guessB ?? ''
        )
        this.state = result.state
        this.guessA = null
        this.guessB = null
        await this.saveState()
        this.broadcastAll(result.messages)
        break
      }

      case 'play_again': {
        const result = handlePlayAgain(this.state)
        this.state = result.state
        this.guessA = null
        this.guessB = null
        await this.saveState()
        this.broadcastAll(result.messages)
        break
      }
    }
  }

  async onClose(connection: Party.Connection): Promise<void> {
    this.broadcast(
      { type: 'opponent_disconnected' },
      [connection.id]
    )
  }

  private getRole(conn: Party.Connection): 'host' | 'guest' {
    const state = conn.state as { role?: string } | undefined
    return state?.role === 'host' ? 'host' : 'guest'
  }

  private broadcast(msg: ServerMessage, exclude?: string[]): void {
    this.room.broadcast(JSON.stringify(msg), exclude)
  }

  private broadcastAll(messages: ServerMessage[]): void {
    for (const msg of messages) {
      this.broadcast(msg)
    }
  }

  private async saveState(): Promise<void> {
    await this.room.storage.put('state', this.state)
  }
}
