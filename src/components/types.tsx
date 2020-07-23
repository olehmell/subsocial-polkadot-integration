export type CommenDto = {
  id: string,
  body: string,
  owner: string,
  created: {
    account: string,
    time: string
  }
  parentId?: string
}