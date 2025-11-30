import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { UserProfile, Pose, Cue } from '../types';
import { Loader, Plus, LogOut, ChevronLeft, Save, Trash2, Mic, Edit } from 'lucide-react';
import VoiceTextarea from '../components/VoiceTextarea';
import { CUE_TYPES, SAMPLE_CATEGORIES } from '../constants';

const Admin: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Editor State
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [editingPose, setEditingPose] = useState<Pose | null>(null);
  
  // -- Editor Form Data --
  const [formDataNameZh, setFormDataNameZh] = useState('');
  const [formDataNameEn, setFormDataNameEn] = useState('');
  const [formDataCategory, setFormDataCategory] = useState('');
  const [formDataCues, setFormDataCues] = useState<Cue[]>([]);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      fetchProfile(session.user.id);
    } else {
      setLoading(false);
    }
  };

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase.from('Users').select('*').eq('id', uid).single();
    if (data) setProfile(data);
    setLoading(false);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setLoading(true);

    if (authMode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message);
      else {
        setAuthSuccess('註冊成功！請檢查信箱驗證，然後登入。');
        // Add to public users table
        if (data.user) {
            await supabase.from('Users').insert({ 
                id: data.user.id, 
                email: email, 
                display_name: email.split('@')[0], 
                role: 'editor' 
            });
        }
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
      else if (data.user) {
        setUser(data.user);
        fetchProfile(data.user.id);
      }
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // --- Editor Logic ---

  const startEdit = (pose: Pose | null) => {
    setEditingPose(pose);
    if (pose) {
      setFormDataNameZh(pose.name_zh);
      setFormDataNameEn(pose.name_en);
      setFormDataCategory(pose.category || '');
      setFormDataCues(pose.cues || []);
    } else {
      // New Pose
      setFormDataNameZh('');
      setFormDataNameEn('');
      setFormDataCategory('');
      setFormDataCues([{ content: '', type: 'entry', sequence: 1 }]); // Default one cue
    }
    setView('editor');
  };

  const handleCueChange = (index: number, field: keyof Cue, value: any) => {
    const newCues = [...formDataCues];
    newCues[index] = { ...newCues[index], [field]: value };
    setFormDataCues(newCues);
  };

  const addCueSlot = () => {
    setFormDataCues([...formDataCues, { content: '', type: 'action', sequence: formDataCues.length + 1 }]);
  };

  const removeCueSlot = (index: number) => {
    const newCues = formDataCues.filter((_, i) => i !== index);
    setFormDataCues(newCues);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!formDataNameZh) return alert("請輸入體式中文名稱");

    setLoading(true);
    try {
        let poseId = editingPose?.id;

        // 1. Upsert Pose
        const posePayload = {
            name_zh: formDataNameZh,
            name_en: formDataNameEn,
            category: formDataCategory,
            // image_url is manual in this MVP
        };

        let result;
        if (poseId) {
            result = await supabase.from('Poses').update(posePayload).eq('id', poseId).select().single();
        } else {
            result = await supabase.from('Poses').insert(posePayload).select().single();
        }

        if (result.error) throw result.error;
        poseId = result.data.id;

        // 2. Handle Cues (Delete existing for this pose then re-insert is easiest for MVP, 
        // OR better: upsert if id exists. For simplicity in MVP, we just insert new ones and update existing)
        
        // For strict correctness in MVP editor without complex ID tracking:
        // We will delete all cues for this pose and re-insert. 
        // (Note: In a high traffic app, use upsert. Here simpler is safer for code gen).
        if (poseId) {
             await supabase.from('Cues').delete().eq('pose_id', poseId);
             
             const cuesToInsert = formDataCues
                .filter(c => c.content.trim() !== '')
                .map((c, i) => ({
                    pose_id: poseId,
                    content: c.content,
                    type: c.type,
                    sequence: i + 1,
                    created_by: user.id
                }));
             
             if (cuesToInsert.length > 0) {
                 const cueRes = await supabase.from('Cues').insert(cuesToInsert);
                 if (cueRes.error) throw cueRes.error;
             }
        }

        alert("儲存成功！");
        setView('list');
    } catch (err: any) {
        alert("儲存失敗: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  // --- Render ---

  if (loading && !user) return <div className="flex justify-center p-20"><Loader className="animate-spin text-yoga-accent" /></div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold text-yoga-accent mb-6 text-center">老師登入 / 註冊</h2>
        {authError && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{authError}</div>}
        {authSuccess && <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">{authSuccess}</div>}
        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="email" placeholder="Email" required 
            className="w-full p-3 border rounded-lg"
            value={email} onChange={e => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Password" required 
            className="w-full p-3 border rounded-lg"
            value={password} onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full py-3 bg-yoga-blue text-white rounded-lg font-bold hover:bg-blue-600 transition">
            {authMode === 'signin' ? '登入' : '註冊'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-500 cursor-pointer" onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}>
          {authMode === 'signin' ? '沒有帳號？點此註冊' : '已有帳號？點此登入'}
        </div>
      </div>
    );
  }

  // LOGGED IN VIEW
  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-800">後台管理</h2>
          <p className="text-sm text-gray-500">歡迎, {profile?.display_name || user.email}</p>
        </div>
        <button onClick={handleSignOut} className="text-gray-500 hover:text-red-500 flex items-center gap-1">
            <LogOut size={18} /> 登出
        </button>
      </div>

      {view === 'list' && (
        <PoseList onEdit={(pose) => startEdit(pose)} onCreate={() => startEdit(null)} />
      )}

      {view === 'editor' && (
        <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
             <button onClick={() => setView('list')} className="text-gray-500 hover:text-gray-800 flex items-center gap-1">
                 <ChevronLeft /> 返回列表
             </button>
             <h3 className="text-xl font-bold text-yoga-accent">
                 {editingPose ? '編輯體式' : '新增體式'}
             </h3>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">中文名稱</label>
                    <input 
                        className="w-full p-3 border rounded-lg" 
                        value={formDataNameZh} 
                        onChange={e => setFormDataNameZh(e.target.value)} 
                        placeholder="例如：下犬式"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">英文名稱</label>
                    <input 
                        className="w-full p-3 border rounded-lg" 
                        value={formDataNameEn} 
                        onChange={e => setFormDataNameEn(e.target.value)} 
                        placeholder="e.g. Downward-Facing Dog"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">分類 (Category)</label>
                <input 
                    list="category-suggestions"
                    className="w-full p-3 border rounded-lg" 
                    value={formDataCategory} 
                    onChange={e => setFormDataCategory(e.target.value)} 
                    placeholder="選擇或輸入新分類..."
                />
                <datalist id="category-suggestions">
                    {SAMPLE_CATEGORIES.map(c => <option key={c} value={c} />)}
                </datalist>
            </div>

            <hr className="border-gray-100" />

            {/* Cues Editor */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-gray-800">教學口令 (Cues)</h4>
                    <button onClick={addCueSlot} className="text-sm bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 flex items-center gap-1">
                        <Plus size={14} /> 新增口令
                    </button>
                </div>
                
                <div className="space-y-4">
                    {formDataCues.map((cue, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 relative">
                            <div className="flex gap-2 mb-2">
                                <span className="bg-white px-2 py-1 rounded text-xs font-mono text-gray-400">#{index + 1}</span>
                                <select 
                                    className="text-sm p-1 rounded border-gray-300"
                                    value={cue.type}
                                    onChange={(e) => handleCueChange(index, 'type', e.target.value)}
                                >
                                    {CUE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                                <button onClick={() => removeCueSlot(index)} className="ml-auto text-red-400 hover:text-red-600">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            
                            <VoiceTextarea 
                                placeholder="輸入口令，或點擊麥克風語音輸入..."
                                rows={2}
                                value={cue.content}
                                onChange={(e) => handleCueChange(index, 'content', e.target.value)}
                                onTranscript={(text) => handleCueChange(index, 'content', 
                                    cue.content ? cue.content + ' ' + text : text
                                )}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Bar */}
            <div className="pt-6 sticky bottom-0 bg-white border-t border-gray-100 flex justify-end gap-3">
                <button onClick={() => setView('list')} className="px-6 py-3 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">
                    取消
                </button>
                <button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="px-6 py-3 rounded-lg bg-yoga-accent text-white font-bold hover:bg-yoga-accentHover shadow-lg shadow-indigo-200 flex items-center gap-2"
                >
                    {loading ? <Loader className="animate-spin" /> : <Save size={20} />}
                    儲存變更
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Component for List View
const PoseList: React.FC<{ onEdit: (p: Pose) => void, onCreate: () => void }> = ({ onEdit, onCreate }) => {
    const [poses, setPoses] = useState<Pose[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('Poses').select('*, cues(*)').order('created_at', { ascending: false });
            if (data) setPoses(data);
            setLoading(false);
        };
        fetch();
    }, []);

    if (loading) return <div className="text-center p-10 text-gray-400">載入中...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-600">體式列表 ({poses.length})</h3>
                <button onClick={onCreate} className="bg-yoga-blue text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-md hover:bg-blue-600">
                    <Plus size={18} /> 新增體式
                </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {poses.map(pose => (
                    <div key={pose.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center hover:shadow-md transition">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">🧘‍♀️</div>
                            <div>
                                <h4 className="font-bold text-gray-800">{pose.name_zh}</h4>
                                <p className="text-xs text-gray-400">{pose.name_en}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 hidden sm:inline-block">
                                {pose.cues?.length || 0} 口令
                            </span>
                            <button onClick={() => onEdit(pose)} className="text-yoga-blue hover:bg-blue-50 p-2 rounded-full">
                                <Edit size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Admin;