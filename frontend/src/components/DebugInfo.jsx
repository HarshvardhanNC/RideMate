import { useAuth } from '../context/AuthContext';
import { useRides } from '../context/RidesContext';

const DebugInfo = () => {
    const { user } = useAuth();
    const { rides, loading, getPostedRides, getJoinedRides } = useRides();
    
    const postedRides = getPostedRides();
    const joinedRides = getJoinedRides();

    return (
        <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
            <h3 className="text-lg font-semibold mb-2 text-yellow-800">Debug Information</h3>
            <div className="text-sm space-y-1">
                <p><strong>User:</strong> {user ? user.name : 'Not logged in'}</p>
                <p><strong>User ID:</strong> {user ? user.id : 'N/A'}</p>
                <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                <p><strong>Total Rides:</strong> {rides ? rides.length : 0}</p>
                <p><strong>Posted Rides:</strong> {postedRides ? postedRides.length : 0}</p>
                <p><strong>Joined Rides:</strong> {joinedRides ? joinedRides.length : 0}</p>
                <p><strong>All Rides:</strong> {JSON.stringify(rides, null, 2)}</p>
            </div>
        </div>
    );
};

export default DebugInfo;
