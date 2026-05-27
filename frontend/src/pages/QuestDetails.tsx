import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import type { Quest } from '../types';
import { ChevronLeft, Send, Upload, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export const QuestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Submission Form State
  const [proofText, setProofText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const fetchQuestDetails = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/quests/${id}`);
      setQuest(data);
    } catch (e: any) {
      toast.error(e.message || 'Quest not found');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestDetails();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Create image preview if valid image
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofText && !file) {
      toast.error('Please fill in text proof or upload a file');
      return;
    }

    setSubmitting(true);
    try {
      // Build Multipart form body
      const formData = new FormData();
      formData.append('questId', id || '');
      if (proofText) formData.append('proofText', proofText);
      if (file) formData.append('file', file);

      await apiFetch('/submissions', {
        method: 'POST',
        body: formData,
      });

      toast.success('Quest submission sent! Awaiting administration review.');
      setProofText('');
      setFile(null);
      setFilePreview(null);
      
      // Refresh page data
      await fetchQuestDetails();
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
      </div>
    );
  }

  if (!quest) return null;

  // Check user submission status
  const userSubmissions = quest.submissions || [];
  const latestSubmission = userSubmissions.length > 0 ? userSubmissions[0] : null;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link 
        to="/dashboard" 
        className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition"
      >
        <ChevronLeft size={16} />
        <span>Back to Board</span>
      </Link>

      {/* Quest Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Details (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl glass-panel bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-zinc-800/40 p-6 md:p-8 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <span className={`
                text-xs font-black tracking-widest px-3 py-1 rounded-full uppercase
                ${quest.type === 'DAILY' ? 'bg-amber-950/40 border border-amber-900/30 text-amber-400' : ''}
                ${quest.type === 'WEEKLY' ? 'bg-violet-950/40 border border-violet-900/30 text-violet-400' : ''}
                ${quest.type === 'ACHIEVEMENT' ? 'bg-cyan-950/40 border border-cyan-800/30 text-cyan-400' : ''}
              `}>
                {quest.type} Quest
              </span>

              {quest.expiresAt && (
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <Clock size={14} />
                  <span>Expires: {new Date(quest.expiresAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-white">
              {quest.title}
            </h1>

            <div className="text-sm text-slate-300 leading-relaxed space-y-4">
              <p className="font-semibold text-slate-200">Objective Description:</p>
              <p className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-900 text-slate-400 text-xs leading-relaxed">
                {quest.description}
              </p>
            </div>

            {/* Rules and verification guide */}
            <div className="border-t border-zinc-900 pt-6 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verification Checklist</h4>
              <ul className="text-xs text-slate-500 space-y-2 list-disc pl-5">
                <li>Submit clear image screenshots, PDF summaries, or detailed logs showing task completion.</li>
                <li>Write a brief outline of the steps completed in the text proof input field.</li>
                <li>Double check file sizes (limit of 5MB per proof).</li>
                <li>Admin moderations can take up to 24 hours to review and reward.</li>
              </ul>
            </div>
          </div>

          {/* Submission History / Status List */}
          {userSubmissions.length > 0 && (
            <div className="rounded-2xl glass-panel bg-zinc-900/20 border border-zinc-900 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Your Submission History</h3>
              <div className="space-y-3">
                {userSubmissions.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-900/60 flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`
                          text-[10px] font-black uppercase px-2 py-0.5 rounded
                          ${sub.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-900/20' : ''}
                          ${sub.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-900/20' : ''}
                          ${sub.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-900/20' : ''}
                        `}>
                          {sub.status}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(sub.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      {sub.proofText && (
                        <p className="text-xs text-slate-400 mt-2 font-medium">
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">Proof text:</span>
                          {sub.proofText}
                        </p>
                      )}
                      {sub.proofUrl && (
                        <a 
                          href={`http://localhost:5000${sub.proofUrl}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs text-violet-400 hover:text-violet-300 font-semibold underline block mt-1"
                        >
                          View Uploaded File
                        </a>
                      )}
                      {sub.adminNotes && (
                        <div className="mt-2 p-2.5 rounded-lg bg-zinc-900 border border-zinc-850 text-xs text-slate-400">
                          <span className="text-rose-400 block text-[9px] uppercase font-bold">Admin feedback:</span>
                          {sub.adminNotes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Panel (Right 1 col) */}
        <div className="space-y-6">
          
          {/* Rewards Summary Box */}
          <div className="rounded-2xl glass-panel bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-zinc-800/40 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Quest Rewards</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-violet-950/20 border border-violet-900/40 p-4 rounded-xl text-center">
                <span className="text-2xl font-black text-violet-400">+{quest.rewardXp}</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase block mt-1">XP Points</span>
              </div>
              <div className="bg-cyan-950/20 border border-cyan-900/40 p-4 rounded-xl text-center">
                <span className="text-2xl font-black text-cyan-400">+{quest.rewardPoints}</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase block mt-1">Gamer Coins</span>
              </div>
            </div>

            {quest.rewardBadge && (
              <div className="mt-4 p-4 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-950/20 border border-yellow-900/30 flex items-center justify-center text-yellow-400">
                  🏆
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">Achievement Badge</p>
                  <p className="text-[10px] text-slate-500 font-medium">Awarded upon completion</p>
                </div>
              </div>
            )}
          </div>

          {/* Proof Submission Card */}
          <div className="rounded-2xl glass-panel bg-gradient-to-tr from-zinc-950 to-zinc-900 border border-zinc-800/40 p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Submit Proof</h3>
            
            {latestSubmission && latestSubmission.status === 'PENDING' ? (
              <div className="text-center p-6 rounded-xl bg-amber-950/15 border border-amber-900/20 space-y-2 text-slate-400">
                <Clock className="text-amber-500 mx-auto" size={24} />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Awaiting Verification</h4>
                <p className="text-[10px] leading-relaxed">
                  Your submission is currently under review by the game masters. You will receive a notification once verified!
                </p>
              </div>
            ) : latestSubmission && latestSubmission.status === 'APPROVED' ? (
              <div className="text-center p-6 rounded-xl bg-emerald-950/15 border border-emerald-900/20 space-y-2 text-slate-400">
                <CheckCircle2 className="text-emerald-500 mx-auto" size={24} />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quest Completed</h4>
                <p className="text-[10px] leading-relaxed">
                  Excellent job! You have completed this quest and your rewards have been added directly to your inventory.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitProof} className="space-y-4">
                {latestSubmission && latestSubmission.status === 'REJECTED' && (
                  <div className="p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl text-[10px] text-rose-400 font-semibold leading-relaxed flex items-start space-x-2">
                    <AlertTriangle className="shrink-0 mt-0.5" size={14} />
                    <span>Your previous attempt was rejected. Review feedback and submit again.</span>
                  </div>
                )}

                {/* Text Proof */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    Completion Description
                  </label>
                  <textarea
                    rows={4}
                    value={proofText}
                    onChange={(e) => setProofText(e.target.value)}
                    placeholder="Provide details about how you completed this task..."
                    className="w-full p-3 bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-xl text-xs text-white placeholder-slate-650 outline-none transition"
                  />
                </div>

                {/* File Upload Box */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    Screenshot / Proof File
                  </label>
                  <div className="relative border-2 border-dashed border-zinc-800 hover:border-violet-500/50 rounded-xl p-4 transition-all text-center flex flex-col items-center justify-center bg-zinc-900/30 cursor-pointer">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="text-slate-500 mb-2" size={20} />
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {file ? file.name : 'Upload file proof (image/doc)'}
                    </span>
                    <span className="text-[8px] text-slate-600 uppercase mt-0.5">
                      Max. 5MB
                    </span>
                  </div>

                  {filePreview && (
                    <div className="mt-2.5 rounded-xl border border-zinc-800 overflow-hidden max-h-40 bg-zinc-900">
                      <img src={filePreview} alt="Proof preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white rounded-xl font-bold text-xs tracking-wider uppercase flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 transition"
                >
                  <Send size={12} />
                  <span>{submitting ? 'Submitting...' : 'Submit Claim'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
