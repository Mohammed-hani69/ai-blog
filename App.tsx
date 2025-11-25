
import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { PublicBlog } from './components/PublicBlog';
import { SinglePost } from './components/SinglePost';
import { Login } from './components/Login';
import { AIStatusTerminal } from './components/AIStatusTerminal';
import { ManualEditor } from './components/ManualEditor';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { DashboardHome } from './components/DashboardHome';
import { CategoryPage } from './components/CategoryPage';
import { AdSettingsPanel } from './components/AdSettingsPanel';
import { AIControlPanel } from './components/AIControlPanel';
import { AdminProfilePanel } from './components/AdminProfile';
import { AllPostsPanel } from './components/AllPostsPanel';
import { BlogPost, AISettings, LogEntry, AIState, Comment, AdSettings, AdminProfile } from './types';
import * as GeminiService from './services/geminiService';
import * as StorageService from './services/storage';
import { isBackendConfigured } from './services/backendClient';

// Error Boundary Component
interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-center" dir="rtl">
          <div className="max-w-md bg-white p-8 rounded-xl shadow-xl">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">عذراً، حدث خطأ غير متوقع</h2>
            <p className="text-slate-500 mb-6">واجه التطبيق مشكلة أثناء العرض. يرجى تحديث الصفحة.</p>
            <pre className="text-xs bg-slate-100 p-2 rounded text-left dir-ltr overflow-auto mb-4 max-h-32">
              {this.state.error?.toString()}
            </pre>
            <button onClick={() => window.location.href = '/'} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              العودة للرئيسية
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const initialSettings: AISettings = {
  niche: 'الذكاء الاصطناعي',
  keywords: 'تعلم الآلة، الأتمتة، تقنيات المستقبل',
  articlesPerDay: 3,
  imageQuality: '1K',
  language: 'Arabic',
  autoPublish: true,
  imageStyle: 'صورة واقعية سينمائية، إضاءة احترافية، دقة عالية'
};

// Sample Data for initial load if DB is empty
const SAMPLE_POSTS: BlogPost[] = [
  {
    id: '101',
    title: 'مستقبل الذكاء الاصطناعي في عام 2025',
    excerpt: 'نظرة شاملة على التطورات المتوقعة في عالم الذكاء الاصطناعي وكيف ستؤثر على حياتنا اليومية.',
    content: '<p>يشهد العالم تطوراً متسارعاً في مجالات الذكاء الاصطناعي...</p><p>هذا المقال يستعرض أهم التوقعات.</p>',
    imageUrl: 'https://picsum.photos/seed/ai1/800/450',
    author: 'الذكاء الاصطناعي',
    date: '2024/10/05',
    tags: ['AI', 'مستقبل', 'تكنولوجيا'],
    category: 'الذكاء الاصطناعي',
    status: 'published',
    views: 1250,
    comments: [],
    trafficSources: { search: 800, social: 300, direct: 100, referral: 50 }
  }
];

function AppContent() {
  // Routing State
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Content State
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [postToEdit, setPostToEdit] = useState<BlogPost | null>(null);
  
  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState('dashboard');

  // App Data - Initialize with empty, then load async
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [settings, setSettings] = useState<AISettings>(initialSettings);
  const [adSettings, setAdSettings] = useState<AdSettings>(StorageService.getAdSettings());
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(StorageService.getAdminProfile());
  const [loadingData, setLoadingData] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(false);
  
  // AI State
  const [aiState, setAiState] = useState<AIState>(AIState.IDLE);
  const [currentArticleCount, setCurrentArticleCount] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  const aiStateRef = useRef(aiState);
  
  useEffect(() => {
      aiStateRef.current = aiState;
  }, [aiState]);

  // Load Data from StorageService (Supabase or Local) on Mount
  useEffect(() => {
    const loadData = async () => {
        setLoadingData(true);
        try {
            // Load Settings
            const loadedSettings = await StorageService.getSettings();
            if (loadedSettings) setSettings(loadedSettings);

            // Load Posts
            const loadedPosts = await StorageService.getPosts();
            if (loadedPosts && loadedPosts.length > 0) {
                setPosts(loadedPosts);
            } else {
                setPosts(SAMPLE_POSTS); // Fallback to sample if truly empty
            }
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoadingData(false);
        }
    };
    loadData().then(() => setBackendAvailable(isBackendConfigured()));
  }, []);

  // Router logic
  const navigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToCategory = (category: string) => {
    setSelectedCategory(category);
    navigate('/category');
  };

  const slugify = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\u0600-\u06FF\-]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .replace(/-+/g, '-');
  };

  // --- Actions that update DB ---

  const handleViewPost = async (post: BlogPost) => {
    const rand = Math.random();
    let source: keyof BlogPost['trafficSources'] = 'direct';
    if (rand < 0.50) source = 'search'; 
    else if (rand < 0.80) source = 'social'; 
    else if (rand < 0.90) source = 'referral'; 

    const updatedPost = { 
        ...post, 
        views: post.views + 1,
        trafficSources: {
            ...post.trafficSources,
            [source]: (post.trafficSources[source] || 0) + 1
        }
    };

    // Optimistic Update
    setPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p));
    
    // Async Save
    await StorageService.savePost(updatedPost);
    
    setSelectedPost(updatedPost);
    const slug = slugify(post.title);
    navigate(`/post/${post.id}/${slug}?fromApp=1`);
  };

  const handleAddComment = async (postId: string, author: string, content: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author,
      content,
      date: new Date().toLocaleDateString('ar-EG'),
      replies: []
    };

    const targetPost = posts.find(p => p.id === postId);
    if (!targetPost) return;

    const updatedPost = { ...targetPost, comments: [newComment, ...targetPost.comments] };

    // Optimistic
    setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
    if (selectedPost?.id === postId) setSelectedPost(updatedPost);

    // Save
    await StorageService.savePost(updatedPost);
  };

  const handleReplyComment = async (postId: string, parentCommentId: string, author: string, content: string) => {
    const newReply: Comment = {
      id: Date.now().toString(),
      author,
      content,
      date: new Date().toLocaleDateString('ar-EG'),
      replies: []
    };

    const addReplyRecursively = (comments: Comment[]): Comment[] => {
        return comments.map(c => {
            if (c.id === parentCommentId) {
                return { ...c, replies: [...(c.replies || []), newReply] };
            }
            if (c.replies && c.replies.length > 0) {
                return { ...c, replies: addReplyRecursively(c.replies) };
            }
            return c;
        });
    };

    const targetPost = posts.find(p => p.id === postId);
    if (!targetPost) return;

    const updatedPost = { ...targetPost, comments: addReplyRecursively(targetPost.comments) };

    // Optimistic
    setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
    if (selectedPost?.id === postId) setSelectedPost(updatedPost);

    // Save
    await StorageService.savePost(updatedPost);
  };

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const now = new Date().toLocaleTimeString([], { hour12: false });
    setLogs(prev => [...prev, { timestamp: now, message, type }]);
  };

  // --- AI Logic ---

  const generateSingleArticle = async (index: number) => {
    addLog(`بدء توليد المقال رقم (${index + 1})...`, 'system');
    setAiState(AIState.ANALYZING_TRENDS);
    
    try {
      const { topic, analysis } = await GeminiService.analyzeTrendsAndPickTopic(settings);
      addLog(`تم تحديد الموضوع: ${topic}`, 'success');

      setAiState(AIState.WRITING_CONTENT);
      addLog('جاري كتابة المقال (Gemini 2.5 Flash)...', 'system');
      const article = await GeminiService.generateArticleContent(topic, settings);
      
      setAiState(AIState.GENERATING_IMAGE);
      addLog('جاري توليد الصورة...', 'system');
      let imageUrl = 'https://picsum.photos/800/450';
      try {
         imageUrl = await GeminiService.generateBlogImage(article.imagePrompt, settings.imageQuality);
      } catch (imgError) {
         addLog('فشل توليد الصورة، استخدام صورة احتياطية.', 'error');
      }

      setAiState(AIState.PUBLISHING);
      const newPost: BlogPost = {
        id: Date.now().toString(),
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        imageUrl: imageUrl,
        author: 'AutoBlog AI',
        date: new Date().toLocaleDateString('ar-EG'),
        tags: article.tags,
        category: article.category,
        status: settings.autoPublish ? 'published' : 'draft',
        views: 0,
        comments: [],
        trafficSources: { search: 0, social: 0, direct: 0, referral: 0 }
      };

      // Save to DB and State
      await StorageService.savePost(newPost);
      setPosts(prev => [newPost, ...prev]);
      
      addLog(`تم نشر المقال: "${newPost.title}"`, 'success');

    } catch (error: any) {
      console.error(error);
      addLog(`خطأ: ${error.message}`, 'error');
    }
  };

  const runAutopilotSequence = async () => {
    if (aiStateRef.current !== AIState.IDLE && aiStateRef.current !== AIState.COMPLETE && aiStateRef.current !== AIState.ERROR) {
        addLog('العملية جارية بالفعل.', 'info');
        return;
    }
    
    setAiState(AIState.IDLE);
    setLogs([]);
    setCurrentArticleCount(0);
    const totalToGenerate = settings.articlesPerDay;
    
    addLog(`بدء دورة الطيار الآلي (Postgres DB Active). الهدف: ${totalToGenerate} مقالات.`, 'system');

    for (let i = 0; i < totalToGenerate; i++) {
        setCurrentArticleCount(i + 1);
        await generateSingleArticle(i);

        if (i < totalToGenerate - 1) {
            setAiState(AIState.WAITING);
            addLog(`انتظار قصير قبل المقال التالي...`, 'system');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    setAiState(AIState.COMPLETE);
    addLog('تم إكمال المهمة بنجاح!', 'success');
    setTimeout(() => { setAiState(AIState.IDLE); setCurrentArticleCount(0); }, 8000);
  };

  const handleSaveSettingsAndStart = async () => {
      // Save settings to DB first
      await StorageService.saveSettings(settings);
      addLog('تم حفظ الإعدادات في قاعدة البيانات (Supabase/Local).', 'success');
      // Start logic
      runAutopilotSequence();
  };

  // Manual Publish
  const handleManualPublish = async (title: string, content: string, category: string) => {
    const newPost: BlogPost = {
      id: Date.now().toString(),
      title: title || "مقال جديد",
      excerpt: content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...",
      content: content,
      imageUrl: 'https://picsum.photos/800/450', 
      author: 'المحرر اليدوي',
      date: new Date().toLocaleDateString('ar-EG'),
      tags: ['يدوي', category],
      category: category,
      status: 'published',
      views: 0,
      comments: [],
      trafficSources: { search: 0, social: 0, direct: 0, referral: 0 }
    };

    await StorageService.savePost(newPost);
    setPosts(prev => [newPost, ...prev]);
    addLog(`تم نشر المقال اليدوي: ${newPost.title}`, 'success');
    setActiveTab('dashboard');
  };

  const handleDeletePost = async (postId: string) => {
    await StorageService.deletePost(postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
    addLog(`تم حذف المقال (ID: ${postId})`, 'success');
  };

  const handleUpdatePost = async (id: string, title: string, content: string, category: string) => {
    // Find existing to preserve other fields
    const existing = posts.find(p => p.id === id);
    if (!existing) return;

    const updated = {
        ...existing,
        title,
        content,
        category,
        excerpt: content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...",
        tags: [...existing.tags.filter(t => t !== existing.category), category]
    };

    await StorageService.savePost(updated);
    setPosts(prev => prev.map(p => p.id === id ? updated : p));
    
    addLog(`تم تحديث المقال: "${title}"`, 'success');
    setPostToEdit(null);
    setActiveTab('all-posts');
  };

  // Settings Updates
  const updateAdSettings = (newSettings: AdSettings) => {
      setAdSettings(newSettings);
      StorageService.saveAdSettings(newSettings);
  };

  const updateAdminProfile = (newProfile: AdminProfile) => {
      setAdminProfile(newProfile);
      StorageService.saveAdminProfile(newProfile);
  };

  // --- Views ---
  if (loadingData) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600" dir="rtl">
              <div className="text-center">
                  <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p>جاري تحميل البيانات من قاعدة البيانات...</p>
              </div>
          </div>
      );
  }

  if (currentPath === '/login') {
    return <Login onLogin={() => { setIsAuthenticated(true); navigate('/dashboard'); }} onBack={() => navigate('/')} adminProfile={adminProfile} />;
  }

  if (currentPath === '/dashboard') {
    if (!isAuthenticated) {
      return <Login onLogin={() => { setIsAuthenticated(true); navigate('/dashboard'); }} onBack={() => navigate('/')} adminProfile={adminProfile} />;
    }
    return (
      <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => { setIsAuthenticated(false); navigate('/'); }} adminProfile={adminProfile} supabaseAvailable={backendAvailable}>
        {activeTab === 'dashboard' && <DashboardHome posts={posts} aiState={aiState} logs={logs} onNavigate={setActiveTab} />}
        {activeTab === 'all-posts' && <AllPostsPanel posts={posts} onEdit={(p) => { setPostToEdit(p); setActiveTab('manual'); }} onDelete={handleDeletePost} />}
        {activeTab === 'analytics' && <AnalyticsDashboard posts={posts} />}
        {activeTab === 'ads' && <AdSettingsPanel settings={adSettings} onSave={updateAdSettings} />}
        {activeTab === 'ai-control' && (
           <AIControlPanel 
              settings={settings} 
              onSettingsChange={setSettings} 
              onStartAI={runAutopilotSequence}
              onSaveAndStart={handleSaveSettingsAndStart}
              aiState={aiState} 
              logs={logs}
              progress={{ current: currentArticleCount, total: settings.articlesPerDay }}
           />
        )}
        {activeTab === 'manual' && <ManualEditor onPublish={handleManualPublish} postToEdit={postToEdit} onUpdate={handleUpdatePost} onCancelEdit={() => { setPostToEdit(null); setActiveTab('all-posts'); }} />}
        {activeTab === 'profile' && <AdminProfilePanel profile={adminProfile} onSave={updateAdminProfile} />}
      </DashboardLayout>
    );
  }

  if ((currentPath && currentPath.startsWith('/post')) && selectedPost) {
    return <SinglePost post={selectedPost} adSettings={adSettings} onBack={() => navigate('/')} onNavigateCategory={navigateToCategory} onAddComment={(a, c) => handleAddComment(selectedPost.id, a, c)} onReplyComment={(id, a, c) => handleReplyComment(selectedPost.id, id, a, c)} />;
  }

  if (currentPath === '/category' && selectedCategory) {
    return <CategoryPage category={selectedCategory} posts={posts} adSettings={adSettings} onNavigate={navigate} onViewPost={handleViewPost} />
  }

  return <PublicBlog posts={posts} adSettings={adSettings} onNavigate={navigate} onViewPost={handleViewPost} onNavigateCategory={navigateToCategory} />;
}

export default function App() {
  return <ErrorBoundary><AppContent /></ErrorBoundary>;
}
