import React, { useState, useEffect } from 'react';

import { User, LogOut, Send, Hash, MessageSquare, UserCircle } from 'lucide-react';



// Supabase configuration placeholder

const SUPABASE_URL = 'YOUR_SUPABASE_URL';

const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';



const RomanForum = () => {

  const [user, setUser] = useState(null);

  const [view, setView] = useState('login');

  const [posts, setPosts] = useState([]);

  const [selectedHashtag, setSelectedHashtag] = useState(null);

  const [newPost, setNewPost] = useState('');

  const [commentText, setCommentText] = useState({});

  

  // Auth states

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [username, setUsername] = useState('');



  // Mock data for demonstration (replace with Supabase calls)

  const mockPosts = [

    {

      id: 1,

      user: 'Caesar Augustus',

      content: 'The Senate has spoken! New reforms are coming. #Politics #Reform',

      hashtags: ['Politics', 'Reform'],

      timestamp: '2h ago',

      comments: [

        { id: 1, user: 'Marcus Brutus', text: 'Et tu, Brute?' }

      ]

    },

    {

      id: 2,

      user: 'Cicero',

      content: 'O tempora, o mores! Discussing philosophy at the baths today. #Philosophy #Life',

      hashtags: ['Philosophy', 'Life'],

      timestamp: '5h ago',

      comments: []

    }

  ];



  useEffect(() => {

    // Initialize with mock data

    if (user) {

      setPosts(mockPosts);

    }

  }, [user]);



  // Supabase integration functions (you'll need to implement these)

  const initSupabase = () => {

    // Replace with actual Supabase client initialization:

    // import { createClient } from '@supabase/supabase-js'

    // const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    console.log('Initialize Supabase with your credentials');

  };



  const handleSignUp = () => {

    if (!email || !password || !username) return;

    // Supabase sign up

    // const { data, error } = await supabase.auth.signUp({ email, password })

    // Then create profile with username

    setUser({ email, username });

    setView('forum');

  };



  const handleLogin = () => {

    if (!email || !password) return;

    // Supabase login

    // const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    setUser({ email, username: username || 'Demo User' });

    setView('forum');

  };



  const handleLogout = () => {

    // await supabase.auth.signOut()

    setUser(null);

    setView('login');

  };



  const extractHashtags = (text) => {

    const hashtagRegex = /#[a-zA-Z0-9_]+/g;

    return text.match(hashtagRegex) || [];

  };



  const handleCreatePost = async () => {

    if (!newPost.trim()) return;

    

    const hashtags = extractHashtags(newPost);

    const post = {

      id: Date.now(),

      user: user.username,

      content: newPost,

      hashtags: hashtags.map(h => h.slice(1)),

      timestamp: 'Just now',

      comments: []

    };

    

    // Insert into Supabase

    // const { data, error } = await supabase.from('posts').insert([post])

    

    setPosts([post, ...posts]);

    setNewPost('');

  };



  const handleAddComment = async (postId) => {

    const text = commentText[postId];

    if (!text?.trim()) return;



    // Insert comment into Supabase

    // await supabase.from('comments').insert([{ post_id: postId, user_id: user.id, text }])

    

    setPosts(posts.map(p => 

      p.id === postId 

        ? { ...p, comments: [...p.comments, { id: Date.now(), user: user.username, text }] }

        : p

    ));

    setCommentText({ ...commentText, [postId]: '' });

  };



  const allHashtags = [...new Set(posts.flatMap(p => p.hashtags))];

  const filteredPosts = selectedHashtag 

    ? posts.filter(p => p.hashtags.includes(selectedHashtag))

    : posts;



  const renderHashtag = (tag) => (

    <span

      key={tag}

      onClick={() => setSelectedHashtag(tag === selectedHashtag ? null : tag)}

      className={`inline-block px-3 py-1 mr-2 mb-2 rounded-full text-sm cursor-pointer transition-all ${

        selectedHashtag === tag

          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'

          : 'bg-white/40 backdrop-blur-sm text-purple-700 hover:bg-white/60'

      }`}

    >

      #{tag}

    </span>

  );



  if (!user) {

    return (

      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 p-8 flex items-center justify-center">

        <div className="w-full max-w-md">

          <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">

            <div className="text-center mb-8">

              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">

                FORVM ROMANVM

              </h1>

              <p className="text-purple-700 italic">Veni, Vidi, Vici</p>

            </div>



            {view === 'login' ? (

              <div className="space-y-4">

                <input

                  type="email"

                  placeholder="Email"

                  value={email}

                  onChange={(e) => setEmail(e.target.value)}

                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}

                  className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur border border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"

                />

                <input

                  type="password"

                  placeholder="Password"

                  value={password}

                  onChange={(e) => setPassword(e.target.value)}

                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}

                  className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur border border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"

                />

                <button

                  onClick={handleLogin}

                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"

                >

                  Enter the Forum

                </button>

                <button

                  onClick={() => setView('signup')}

                  className="w-full py-3 bg-white/50 backdrop-blur text-purple-700 rounded-xl font-semibold border border-white/60 hover:bg-white/70 transition-all"

                >

                  Create Account

                </button>

              </div>

            ) : (

              <div className="space-y-4">

                <input

                  type="text"

                  placeholder="Username"

                  value={username}

                  onChange={(e) => setUsername(e.target.value)}

                  className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur border border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"

                />

                <input

                  type="email"

                  placeholder="Email"

                  value={email}

                  onChange={(e) => setEmail(e.target.value)}

                  className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur border border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"

                />

                <input

                  type="password"

                  placeholder="Password"

                  value={password}

                  onChange={(e) => setPassword(e.target.value)}

                  onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}

                  className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur border border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400"

                />

                <button

                  onClick={handleSignUp}

                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"

                >

                  Join the Senate

                </button>

                <button

                  onClick={() => setView('login')}

                  className="w-full py-3 bg-white/50 backdrop-blur text-purple-700 rounded-xl font-semibold border border-white/60 hover:bg-white/70 transition-all"

                >

                  Back to Login

                </button>

              </div>

            )}

          </div>

        </div>



        {/* Decorative Roman Columns */}

        <div className="fixed bottom-0 left-0 w-32 h-64 bg-gradient-to-t from-white/40 to-transparent backdrop-blur-sm border-l-4 border-r-4 border-white/60 rounded-t-lg"></div>

        <div className="fixed bottom-0 right-0 w-32 h-64 bg-gradient-to-t from-white/40 to-transparent backdrop-blur-sm border-l-4 border-r-4 border-white/60 rounded-t-lg"></div>

      </div>

    );

  }



  return (

    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-blue-300 p-4">

      {/* Header */}

      <div className="max-w-6xl mx-auto mb-6">

        <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6">

          <div className="flex items-center justify-between">

            <div>

              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">

                FORVM ROMANVM

              </h1>

              <p className="text-purple-700 italic mt-1">The Agora of the Digital Age</p>

            </div>

            <div className="flex items-center gap-4">

              <div className="flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur rounded-full">

                <UserCircle className="text-purple-600" size={20} />

                <span className="text-purple-700 font-medium">{user.username}</span>

              </div>

              <button

                onClick={handleLogout}

                className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:shadow-lg transition-all hover:scale-110"

              >

                <LogOut size={20} />

              </button>

            </div>

          </div>

        </div>

      </div>



      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Hashtags Sidebar */}

        <div className="lg:col-span-1">

          <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 sticky top-4">

            <div className="flex items-center gap-2 mb-4">

              <Hash className="text-purple-600" size={24} />

              <h2 className="text-xl font-bold text-purple-700">Trending Tags</h2>

            </div>

            <div className="space-y-2">

              {allHashtags.map(tag => renderHashtag(tag))}

              {allHashtags.length === 0 && (

                <p className="text-purple-600 text-sm italic">No hashtags yet</p>

              )}

            </div>

            {selectedHashtag && (

              <button

                onClick={() => setSelectedHashtag(null)}

                className="w-full mt-4 py-2 bg-white/40 backdrop-blur text-purple-700 rounded-xl text-sm hover:bg-white/60 transition-all"

              >

                Clear Filter

              </button>

            )}

          </div>

        </div>



        {/* Main Feed */}

        <div className="lg:col-span-3 space-y-6">

          {/* Create Post */}

          <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6">

            <h3 className="text-lg font-bold text-purple-700 mb-4">Share Your Wisdom</h3>

            <textarea

              value={newPost}

              onChange={(e) => setNewPost(e.target.value)}

              placeholder="What's on your mind, citizen? Use #hashtags..."

              className="w-full px-4 py-3 rounded-xl bg-white/50 backdrop-blur border border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"

              rows="3"

            />

            <button

              onClick={handleCreatePost}

              className="mt-3 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"

            >

              <Send size={18} />

              Post to Forum

            </button>

          </div>



          {/* Posts */}

          {filteredPosts.map(post => (

            <div key={post.id} className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6">

              <div className="flex items-start gap-4">

                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold shadow-lg">

                  {post.user[0]}

                </div>

                <div className="flex-1">

                  <div className="flex items-center justify-between mb-2">

                    <h4 className="font-bold text-purple-700">{post.user}</h4>

                    <span className="text-sm text-purple-600">{post.timestamp}</span>

                  </div>

                  <p className="text-gray-800 mb-3">{post.content}</p>

                  <div className="mb-4">

                    {post.hashtags.map(tag => renderHashtag(tag))}

                  </div>



                  {/* Comments */}

                  {post.comments.length > 0 && (

                    <div className="space-y-3 mb-4 pl-4 border-l-2 border-purple-300">

                      {post.comments.map(comment => (

                        <div key={comment.id} className="bg-white/40 backdrop-blur rounded-xl p-3">

                          <p className="font-semibold text-purple-700 text-sm">{comment.user}</p>

                          <p className="text-gray-700 text-sm">{comment.text}</p>

                        </div>

                      ))}

                    </div>

                  )}



                  {/* Add Comment */}

                  <div className="flex gap-2">

                    <input

                      type="text"

                      value={commentText[post.id] || ''}

                      onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}

                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}

                      placeholder="Add a comment..."

                      className="flex-1 px-4 py-2 rounded-xl bg-white/50 backdrop-blur border border-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"

                    />

                    <button

                      onClick={() => handleAddComment(post.id)}

                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2"

                    >

                      <MessageSquare size={16} />

                    </button>

                  </div>

                </div>

              </div>

            </div>

          ))}



          {filteredPosts.length === 0 && (

            <div className="bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-12 text-center">

              <p className="text-purple-700 text-lg italic">No posts found. Be the first to speak!</p>

            </div>

          )}

        </div>

      </div>



      {/* Decorative Roman Columns */}

      <div className="fixed bottom-0 left-0 w-24 h-48 bg-gradient-to-t from-white/40 to-transparent backdrop-blur-sm border-l-4 border-r-4 border-white/60 rounded-t-lg hidden lg:block"></div>

      <div className="fixed bottom-0 right-0 w-24 h-48 bg-gradient-to-t from-white/40 to-transparent backdrop-blur-sm border-l-4 border-r-4 border-white/60 rounded-t-lg hidden lg:block"></div>

    </div>

  );

};
