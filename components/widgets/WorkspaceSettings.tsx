'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Copy, Check, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function WorkspaceSettings({
  activeWorkspace,
}: {
  activeWorkspace: {
    id: string;
    name: string;
    inviteCode: string;
    ownerId: string;
  };
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function copyCode() {
    navigator.clipboard.writeText(activeWorkspace.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('/api/workspace/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCodeInput.trim() }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setSuccess(`Đã tham gia nhóm: ${data.workspaceName}`);
        setInviteCodeInput('');
        router.refresh();
      } else {
        setError(data.error || 'Có lỗi xảy ra');
      }
    } catch {
      setError('Lỗi kết nối mạng');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className='glass-card macos-shadow'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-base'>
          <Users className='w-4 h-4' />
          Không gian làm việc
        </CardTitle>
        <CardDescription>
          Mã mời cho nhóm <strong>{activeWorkspace.name}</strong> hoặc tham gia nhóm khác
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        
        {/* Current Workspace Info */}
        <div className="space-y-2">
          <Label>Mã mời của nhóm hiện tại (Đưa mã này cho người nhà)</Label>
          <div className="flex gap-2">
            <Input 
              readOnly 
              value={activeWorkspace.inviteCode} 
              className="font-mono font-bold tracking-widest text-center text-primary"
            />
            <Button variant="outline" size="icon" onClick={copyCode} className="shrink-0">
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="relative border-t border-muted my-6">
          <div className="absolute left-1/2 -top-3 -translate-x-1/2 bg-background px-2 text-xs text-muted-foreground">
            HOẶC
          </div>
        </div>

        {/* Join new Workspace */}
        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-2">
            <Label>Tham gia nhóm khác bằng mã mời</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="Ví dụ: 1A2B3C4D" 
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                required
                maxLength={8}
                className="font-mono uppercase transition-all"
              />
              <Button type="submit" disabled={loading || !inviteCodeInput.trim()}>
                <LogIn className="w-4 h-4" />
              </Button>
            </div>
            {error && <p className="text-sm text-destructive font-medium">{error}</p>}
            {success && <p className="text-sm text-green-500 font-medium">{success}</p>}
          </div>
        </form>

      </CardContent>
    </Card>
  );
}
