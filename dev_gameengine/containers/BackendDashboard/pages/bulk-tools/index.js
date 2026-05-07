import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import TopBar from '@GFComponents/TopBar';
import GameEngineBox from '@GFComponents/GameEngineBox';
import Button from '@GFComponents/Button';
import GetHelp from '@GFComponents/GetHelp';
import GFLabel from '@GFComponents/Labels/GFLabel';
import { useSelector } from 'react-redux';

const BulkTools = () => {
  const pointTypes = useSelector(state => state.pointTypes?.data || []);

  const [action, setAction] = useState('award');
  const [pointTypeId, setPointTypeId] = useState('');
  const [amount, setAmount] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    if (pointTypes?.length && !pointTypeId) {
      setPointTypeId(String(pointTypes[0]?.id || ''));
    }
  }, [pointTypes]);

  const handleUserSearch = (value) => {
    setUserSearch(value);
    clearTimeout(searchTimeout.current);
    if (!value.trim()) {
      setUserResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await apiFetch({ path: `/wp/v2/users?search=${encodeURIComponent(value)}&per_page=10` });
        setUserResults(results);
      } catch {
        setUserResults([]);
      }
    }, 300);
  };

  const toggleUser = (user) => {
    setSelectedUsers(prev =>
      prev.find(u => u.id === user.id)
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    );
  };

  const removeUser = (id) => setSelectedUsers(prev => prev.filter(u => u.id !== id));

  const handleSubmit = async () => {
    if (!selectedUsers.length || !pointTypeId) return;
    setSubmitting(true);
    setNotice(null);
    try {
      const res = await apiFetch({
        path: '/gameengine/v1/points/bulk',
        method: 'POST',
        data: {
          action,
          point_type_id: parseInt(pointTypeId, 10),
          amount: action !== 'reset' ? parseInt(amount, 10) : 0,
          user_ids: selectedUsers.map(u => u.id),
        },
      });
      setNotice({ type: 'success', message: res?.message || __('Operation completed successfully.', 'gameengine') });
      setSelectedUsers([]);
      setAmount('');
    } catch (err) {
      setNotice({ type: 'error', message: err?.message || __('Operation failed.', 'gameengine') });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <TopBar path={__('Bulk Tools', 'gameengine')} rightContent={<GetHelp filterText={['bulk']} />} />

      <div className="gameengine-page-content">
        <div className="flex justify-between items-center py-6 px-1">
          <GFLabel type="plainHeading" margin={0} label={__('Bulk Admin Tools', 'gameengine')} />
        </div>

        {notice && (
          <div className={`p-3 mb-4 rounded text-sm ${notice.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {notice.message}
          </div>
        )}

        <GameEngineBox dynamicClasses="bulk-tools">
          <div className="flex flex-col gap-5 p-2">

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">{__('Action', 'gameengine')}</label>
              <select
                className="border border-gray-300 rounded px-3 py-2 text-sm max-w-xs"
                value={action}
                onChange={e => setAction(e.target.value)}
              >
                <option value="award">{__('Award Points', 'gameengine')}</option>
                <option value="deduct">{__('Deduct Points', 'gameengine')}</option>
                <option value="reset">{__('Reset Balance', 'gameengine')}</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">{__('Point Type', 'gameengine')}</label>
              <select
                className="border border-gray-300 rounded px-3 py-2 text-sm max-w-xs"
                value={pointTypeId}
                onChange={e => setPointTypeId(e.target.value)}
              >
                {pointTypes.map(pt => (
                  <option key={pt.id} value={pt.id}>{pt.name}</option>
                ))}
              </select>
            </div>

            {action !== 'reset' && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">{__('Amount', 'gameengine')}</label>
                <input
                  type="number"
                  min="1"
                  className="border border-gray-300 rounded px-3 py-2 text-sm max-w-xs"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder={__('Enter amount', 'gameengine')}
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">{__('Search Users', 'gameengine')}</label>
              <input
                type="text"
                className="border border-gray-300 rounded px-3 py-2 text-sm max-w-sm"
                value={userSearch}
                onChange={e => handleUserSearch(e.target.value)}
                placeholder={__('Type name or email...', 'gameengine')}
              />
              {userResults.length > 0 && (
                <div className="border border-gray-200 rounded bg-white shadow-sm max-w-sm max-h-48 overflow-y-auto mt-1">
                  {userResults.map(user => (
                    <div
                      key={user.id}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                      onClick={() => toggleUser(user)}
                    >
                      <span>{user.name} <span className="text-gray-400 text-xs">({user.slug})</span></span>
                      {selectedUsers.find(u => u.id === user.id) && (
                        <span className="text-green-600 text-xs font-medium">{__('Selected', 'gameengine')}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  {__('Selected Users', 'gameengine')} ({selectedUsers.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <span
                      key={user.id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200"
                    >
                      {user.name}
                      <button
                        className="text-blue-400 hover:text-red-500 ml-1"
                        onClick={() => removeUser(user.id)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                label={submitting ? __('Processing…', 'gameengine') : __('Apply to Selected Users', 'gameengine')}
                isDisabled={submitting || !selectedUsers.length || (!amount && action !== 'reset')}
                isLoading={submitting}
                onClick={handleSubmit}
              />
              {selectedUsers.length > 0 && (
                <Button
                  preset="gray"
                  label={__('Clear Selection', 'gameengine')}
                  onClick={() => setSelectedUsers([])}
                />
              )}
            </div>
          </div>
        </GameEngineBox>
      </div>
    </>
  );
};

export default BulkTools;
