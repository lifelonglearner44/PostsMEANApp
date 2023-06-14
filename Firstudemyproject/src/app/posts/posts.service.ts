import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { map } from 'rxjs/operators';
import { Router } from "@angular/router";

import { Post } from "./post.model";

@Injectable({ providedIn: "root" })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts() {
    this.http
      .get<{ message: string; posts: any }>("http://localhost:3000/api/posts")
      .pipe(
        map((postData) => {
        return postData.posts.map((post: Post) => {
          return {
            title: post.title,
            content: post.content,
            _id: post._id,
            imagePath: post.imagePath
          };
        });
      }))
      .subscribe(transformedPosts => {
        this.posts = transformedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(_id: string) {
    return this.http.get<{_id: string, title: string, content: string, imagePath: string}>(
      "http://localhost:3000/api/posts/" + _id);


  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title)
    this.http
      .post<{ message: string, post: Post }>(
        "http://localhost:3000/api/posts",
        postData
      )
      .subscribe(responseData => {
        const post: Post = {
          _id: responseData.post._id,
          title: title,
          content: content,
          imagePath: responseData.post.imagePath
        };
          this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
  }

  /* this method below doesn't work either, it is spitting this error:
  MongoServerError: Performing an update on the path '_id' would modify the immutable field '_id'
*/

  updatePost(_id: string, title: string, content: string, image: File | string){
    let postData: Post | FormData;
    if (typeof image === 'object') {
      postData = new FormData ();
      postData.append('_id', _id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        _id: _id,
        title: title,
        content: content,
        imagePath: image
      };
    }
    this.http
      .put("http://localhost:3000/api/posts/" + _id, postData )
      .subscribe(response => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p._id === _id);
        const post: Post = {
          _id: _id,
          title: title,
          content: content,
          imagePath: ''
        }
        updatedPosts[oldPostIndex] = post ;
        this.posts = updatedPosts;``
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
}


  /*
  This is what the tutorial had:

  updatePost(_id: string, title: string, content: string){
    const post: Post = { _id: "", title: title, content: content };
    this.http
      .put("http://localhost:3000/api/posts/" + _id, post)
      .subscribe(response => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p._id == post._id);
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
  }

*/


  deletePost(postId: string) {
    this.http
    .delete("http://localhost:3000/api/posts/" + postId)
      .subscribe(() => {
        const updatedPosts = this.posts.filter(post => post._id !== postId);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }
}
