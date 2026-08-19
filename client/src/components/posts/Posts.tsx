import Post from '../post/Post';
import { PostsProps } from '../../types';

export default function Posts({ posts }: PostsProps) {
    return (
      <div className="posts">
        {posts.map((p) => (
          <Post key={p._id} post={p} />
        ))}
      </div>
    );
}
