import React from 'react'
import { Comment, Avatar, Form, Button, List, Input } from 'antd';
import ViewComment from './ViewComment';
import { CommenDto } from './types';

const DEFAULT_ACCOUNT = 'Han Solo'

const { TextArea } = Input;

type CommentListProps = {
  comments: CommenDto[]
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

type CommentsState = {
  comments: CommenDto[],
  submitting: boolean,
  value: string,
}

export class Comments extends React.Component<any, CommentsState> {
  state: CommentsState = {
    comments: [],
    submitting: false,
    value: '',
  };

  handleSubmit = () => {
    if (!this.state.value) {
      return;
    }

    this.setState({
      submitting: true,
    });

    setTimeout(() => {
      const comment: CommenDto = {
        id: new Date().getTime().toString(),
        owner: DEFAULT_ACCOUNT,
        body: this.state.value,
        created: {
          account: DEFAULT_ACCOUNT,
          time: new Date().toUTCString()
        },
        parentId: undefined // TODO add parent id
      }
      console.log('New comment:', comment)

      this.setState({
        submitting: false,
        value: '',
        comments: [
          comment,
          ...this.state.comments,
        ],
      });
    }, 1000);
  };

  handleChange = (e: React.ChangeEvent<any>) => {
    this.setState({
      value: e.target.value,
    });
  };

  render() {
    const { comments, submitting, value } = this.state;

    return (
      <>
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
              onChange={this.handleChange}
              onSubmit={this.handleSubmit}
              submitting={submitting}
              value={value}
            />
          }
        />
      </>
    );
  }
}
