"use client";

import { Post } from "../SocialFeedApp";
import PostItem from "./PostItem";

interface PostListProps {
    posts: Post[];
    onLike: (postId: string) => void;
}

const PostList = ({ posts, onLike }: PostListProps) => {
    if (posts.length === 0) {
        return (
            <div className="card card-border bg-base-100">
                <div className="card-body text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-base-200 rounded-full flex items-center justify-center mb-4">
                        <span className="iconify lucide--message-circle size-8 text-base-content/50"></span>
                    </div>
                    <h3 className="text-lg font-medium mb-2">No hay publicaciones</h3>
                    <p className="text-base-content/70">Sé el primero en compartir algo con la comunidad</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {posts.map((post) => (
                <PostItem 
                    key={post.id} 
                    post={post} 
                    onLike={onLike}
                />
            ))}
        </div>
    );
};

export default PostList;

