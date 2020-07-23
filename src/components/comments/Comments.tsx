import React, { useState, useEffect } from 'react'
import { Comment, Avatar, Form, Button, List, Input } from 'antd';
import ViewComment from './ViewComment';
import { CommentDto } from './types';
import { useOrbitDbContext } from '../orbitdb';

const { TextArea } = Input;

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

type EditorProps = {
  value?: string,
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
  onSubmit?: () => void,
  submitting?: boolean
}

const Editor = ({ onChange, onSubmit, submitting, value = '' }: EditorProps) => (
  <>
    <Form.Item>
      <TextArea rows={4} onChange={onChange} value={value} />
    </Form.Item>
    <Form.Item>
      <Button htmlType="submit" loading={submitting} onClick={onSubmit} type="primary">
        Add Comment
      </Button>
    </Form.Item>
  </>
);

type CommentValue = Omit<CommentDto,'id'> & {
  id?: string
}

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
  const [ submitting, setSubmitting ] = useState(false)
  const [ value, setValue ] = useState('')

  const { db, owner } = useOrbitDbContext()

  const loadAllComments = () => {
    const allComments: CommentDto[] = db.iterator({ limit: -1 /*, reverse: true*/ })
      .collect()
      .map(feedItemToComment)

    setComments(allComments)
  }

  useEffect(loadAllComments, [])

  const addComment = async (body: string) => {
    const comment: CommentValue = {
      owner,
      body: body?.trim(),
      created: {
        account: owner,
        time: new Date().toUTCString()
      },
      parentId: undefined // TODO add parent id
    }
    const hash = await db.add(comment, { pin: true })
    console.log('Added to OrbitDB log under hash:', hash)

    setComments([ ...comments, { id: hash, ...comment }])
  }

  const handleSubmit = async () => {
    if (!value) {
      return;
    }

    setSubmitting(true);
    
    await addComment(value)
    
    setSubmitting(false)
    setValue('')
  };

  const handleChange = (e: React.ChangeEvent<any>) => {
    setValue(e.target.value)
  };

  return <>
    {comments.length > 0 && <CommentList comments={comments} />}
    <Comment
      avatar={
        <Avatar
          src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
          alt="Han Solo"
        />
      }
      content={
        <Editor
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          value={value}
        />
      }
    />
  </>
}
