import React, { useState, useEffect } from 'react'
import { List } from 'antd';
import ViewComment from './ViewComment';
import { CommentDto, CommentValue } from './types';
import { useOrbitDbContext } from '../orbitdb';
import CommentEditor from './CommentEditor';

type CommentListProps = {
  comments: CommentDto[]
}

const CommentList = ({ comments }: CommentListProps) => (
  <List
    dataSource={comments}
    header={`${comments.length} ${comments.length > 1 ? 'replies' : 'reply'}`}
    itemLayout="horizontal"
    renderItem={(comment) => <ViewComment comment={comment} />}
  />
);

const feedItemToComment = (e: any): CommentDto => {
  // console.log('e', e)
  const value = e.payload.value as CommentValue
  return {
    id: e.hash as string,
    ...value
  }
}

export const Comments = () => {
  const [ comments, setComments ] = useState<CommentDto[]>([])

  const { db } = useOrbitDbContext()

  const loadAllComments = () => {
    const allComments: CommentDto[] = db.iterator({ limit: -1 /*, reverse: true*/ })
      .collect()
      .map(feedItemToComment)

    setComments(allComments)
  }

  const onCommentAdded = (comment: CommentDto) => setComments([ ...comments, comment ])

  useEffect(loadAllComments, [])

  return <div>
    <CommentEditor onCommentAdded={onCommentAdded} />
    {comments.length > 0 && <CommentList comments={comments} />}
  </div>
}
