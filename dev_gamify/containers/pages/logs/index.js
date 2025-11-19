import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLogs } from '../../../redux/Slices/logsSlice';


const Logs = () => {
    const dispatch = useDispatch();
    const { items: logs, status, error, pagination } = useSelector((state) => state.logs);
    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchLogs({ page: 1 }));
        }
    }, [status, dispatch]);

    if (status === 'loading') {
        return <div>Loading logs...</div>;
    }

    if (status === 'failed') {
        return <div>Error fetching logs: {error}</div>;
    }

    return (
        <div>
            <h1>Activity Logs</h1>
            <p>Total logs: {pagination.total}</p>
            <table>
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>User ID</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map(log => (
                        <tr key={log.id}>
                            <td>{log.event_name}</td>
                            <td>{log.user_id}</td>
                            <td>{log.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* A pagination component could be added here */}
        </div>
    );
};

export default Logs;