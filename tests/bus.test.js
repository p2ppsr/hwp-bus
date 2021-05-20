const bus = require('../bus')
const mockState = require('./mockState')
const { createEvent } = require('@cwi/busdriver')

jest.mock('@cwi/busdriver')

const tx = {
  tx: {
    h: 'MOCK_TXID'
  },
  in: [{
    e: { a: 'SENDER' }
  }],
  out: [{
    s2: '1He11omzQsAeYa2JUj52sFZRQEsSzPFNZx',
    s3: 'SENDER',
    s4: 'Hello World!'
  }]
}

describe('bus', () => {
  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { })
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('Contains correct parameters', () => {
    expect(bus).toEqual({
      busdriver: '0.1.1',
      id: '1Prq8NfyBH2mGaGG3jPcbfgH4JXj5aK9sN',
      startingBlockHeight: 687500,
      boardPassenger: expect.any(Function),
      ejectPassenger: expect.any(Function),
      busRoute: {
        find: {
          'out.i': 0,
          'out.o0': 'OP_0',
          'out.o1': 'OP_RETURN',
          'out.s2': '1He11omzQsAeYa2JUj52sFZRQEsSzPFNZx'
        }
      }
    })
  })
  describe('boardPassenger', () => {
    it('Inserts the HWP message', async () => {
      await bus.boardPassenger(mockState, tx)
      expect(mockState.create).toHaveBeenLastCalledWith({
        collection: 'hello',
        data: {
          sender: 'SENDER',
          message: 'Hello World!',
          _id: 'MOCK_TXID'
        }
      })
    })
    it('Broadcasts the HWP message over the socket', async () => {
      await bus.boardPassenger(mockState, tx)
      expect(createEvent).toHaveBeenLastCalledWith({
        sender: 'SENDER',
        message: 'Hello World!',
        _id: 'MOCK_TXID'
      })
    })
  })
  describe('ejectPassenger', () => {
    it('Calls state.delete with the correct parameters', async () => {
      await bus.ejectPassenger(mockState, 'MOCK_TXID')
      expect(mockState.delete).toHaveBeenLastCalledWith({
        collection: 'hello',
        find: { _id: 'MOCK_TXID' }
      })
    })
  })
})
