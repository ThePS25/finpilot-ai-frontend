import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { profileApi } from '@/api/profile.api';
import { Button, Card, DataTable, Modal, Input, Select, Loader, tableStyles } from '@/components/ui';
import { PROFILE_RELATIONS } from '@/types';
import type { Profile } from '@/types';
import { getErrorMessage } from '@/utils/format';

export function ProfilesPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => (await profileApi.getAll()).data.data.profiles,
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const createMutation = useMutation({
    mutationFn: (d: Partial<Profile>) => editing ? profileApi.update(editing._id, d) : profileApi.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      setModalOpen(false);
      setEditing(null);
      reset();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => profileApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profiles'] }),
  });

  const setPrimaryMutation = useMutation({
    mutationFn: (id: string) => profileApi.setPrimary(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profiles'] }),
  });

  const openCreate = () => { setEditing(null); reset({}); setModalOpen(true); };
  const openEdit = (p: Profile) => {
    setEditing(p);
    reset({ name: p.name, relation: p.relation, occupation: p.occupation, dateOfBirth: p.dateOfBirth?.split('T')[0] });
    setModalOpen(true);
  };

  if (isLoading) return <Loader fullPage />;

  return (
    <>
      <Card title="Family Profiles" action={<Button onClick={openCreate}>+ Add Profile</Button>}>
        <DataTable
          data={data || []}
          emptyMessage="No profiles yet. Add your first profile."
          columns={[
            { key: 'name', header: 'Name', render: (p) => p.name },
            { key: 'relation', header: 'Relation', render: (p) => <span className={tableStyles.badge}>{p.relation}</span> },
            { key: 'occupation', header: 'Occupation', render: (p) => p.occupation || '—' },
            { key: 'primary', header: 'Primary', render: (p) => p.isPrimary ? '✓' : '—' },
            {
              key: 'actions', header: 'Actions',
              render: (p) => (
                <div className={tableStyles.actions}>
                  <Button size="sm" variant="outline" onClick={() => openEdit(p)}>Edit</Button>
                  {!p.isPrimary && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => setPrimaryMutation.mutate(p._id)} disabled={setPrimaryMutation.isPending}>
                        Make Primary
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(p._id)}>Delete</Button>
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Profile' : 'Add Profile'}
        footer={<>
          <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit((d) => createMutation.mutate(d))} disabled={isSubmitting}>
            {editing ? 'Update' : 'Create'}
          </Button>
        </>}
      >
        {error && <div style={{ color: '#EF4444', marginBottom: 12, fontSize: 14 }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Name" {...register('name', { required: true })} />
          <Select label="Relation" options={PROFILE_RELATIONS.map((r) => ({ value: r, label: r }))} {...register('relation')} />
          <Input label="Occupation" {...register('occupation')} />
          <Input label="Date of Birth" type="date" {...register('dateOfBirth')} />
        </div>
      </Modal>
    </>
  );
}
