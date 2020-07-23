import { useEffect, useState } from 'react'
import { Comments } from '../components/Comments'

const IpfsClient = require('ipfs-http-client')
const OrbitDB = require('orbit-db')

const ipfs = IpfsClient('/ip4/127.0.0.1/tcp/5001')

// Your identity id can be retrieved with:
// console.log(db.identity.id)

type Orbit = {
  orbitdb: any
  db: any
}

type Message = {
  hash: string
  value: object
}

export function HelloOrbit({ orbitdb, db }: Orbit) {
  const [ hashes, setHashes ] = useState<string[]>([])
  const [ messages, setMessages ] = useState<Message[]>([])

  // useEffect(() => {
  //   reloadMessages()
  // }, [ hashes.length ])

  const reloadMessages = () => {
    const allMessages = db.iterator({ limit: -1, reverse: true })
      .collect()
      .map((e: any) => {
        // console.log('e', e)
        return {
          hash: e.hash,
          value: e.payload.value
        }
      })

    setMessages(allMessages)
  }

  const addToLog = async () => {
    const msg = { name: 'Oleh at ' + new Date().toLocaleString() }
    const hash = await db.add(msg, { pin: true })
    console.log('Added to OrbitDB log under hash:', hash)

    const newHashes = hashes.concat(hash)
    console.log('New hashes:', newHashes)

    setHashes(newHashes)

    reloadMessages()
  }

  return <>
    <div>Hashes count: {hashes.length}</div>
    <div><button onClick={addToLog}>Add to log</button></div>
    <div><ol>{messages.map(({ hash, value }) =>
      <li key={hash}>
        <code>{JSON.stringify(value)}</code>
        <span style={{ color: 'grey' }}> • Hash: <code>{hash}</code></span>
      </li>
    )}</ol></div>
  </>
}

export default function OrbitContext() {
  const [ orbit, setOrbit ] = useState<Orbit>()

  useEffect(() => {
    async function initOrbitDB() {
      // Oleh's pub key: 
      // 3044022022b77f26a744e429c0ae88c66215038190a5114d2e05e44b96af72b77bc43a4b02206d73182b74d40e11690af11afe95d0fa372287b13d754c92ff98c7254eaf6890

      // Oleh's id:
      // 03c4097f9403cd349a867455fa80272171fbb20a604e8a572aff8d30ac073a0b7b

      const orbitdb = await OrbitDB.createInstance(ipfs)
      // const db = await orbitdb.log('hello2') // this works!
      console.log(orbitdb)
      const orbitdbAddress = '/orbitdb/zdpuB2f8FEQgrzAnnvPcpqhcVPgPSGwpXyjgqat6rLEHMtkbu/user.comments'
      const db = await orbitdb.open(orbitdbAddress, {
        // create: true,
        type: 'feed',
        replicate: true
        // overwrite (boolean): Overwrite an existing database (Default: false)
        // replicate (boolean): Replicate the database with peers, requires IPFS PubSub. (Default: true)
      })

      // const peerId = ''
      // await db.access.grant('write', id2)

      // Doesn't work
      // const db = await orbitdb.create('user.comments', 'feed', {
      //   accessController: {
      //     write: [
      //       // Give access to ourselves
      //       orbitdb.identity.id,
      //       // Give access to the second peer
      //       // peerId
      //     ]
      //   },
      //   // overwrite: true,
      //   // replicate: false,
      //   // meta: { hello: 'meta hello' }
      // })
      await db.load()
      // database is now ready to be queried

      setOrbit({ orbitdb, db })
      if (window) {
        (window as any).orbitdb = orbitdb;
        (window as any).db = db;
        // console.log('HINT: See window.orbitdb and window.db')
      }
      console.log('orbitdb.identity:', orbitdb.identity)
      console.log('OrbitDB db:', db)
    }
    initOrbitDB()
  }, [ false ])

  const status = orbit
    ? <b style={{ color: 'green' }}>READY</b>
    : <em style={{ color: 'red' }}>Connecting...</em>

  return <>
    <div>OrbitDB: {status}</div>
    {orbit && <HelloOrbit {...orbit} />}
    <Comments />
  </>
}


// To get all store entries:

// console.log('All entries:\n',
//   db.iterator({ limit: -1 })
//     .collect()
//     .map((e) => e.payload.value))