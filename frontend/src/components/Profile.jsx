import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";

function Profile() {
    const { user, getMyProfileInfo } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                await getMyProfileInfo();
            } catch (error) {
                console.error("Profile Fetch Error:", error);
                setError("Failed to load profile. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [getMyProfileInfo]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-4 py-2">
                <div className="mt-4 max-w-4xl mx-auto bg-red-50 border border-red-200 p-4 rounded text-center text-red-800">
                    {error}
                </div>
            </div>
        );
    }

    if (!user) {
        return <p className="text-center mt-4">No profile information available.</p>;
    }

    return (
        <div className="px-4 py-6">
            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
                <div className="flex items-center p-6 bg-gray-100">
                    <div className="w-24 h-24 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                        <img
                            src="https://via.placeholder.com/150"
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="ml-6">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {user.firstName} {user.lastName}
                        </h2>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-600">Role: {user.role}</p>
                    </div>
                </div>
                <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Profile Details</h3>
                    <table className="table-auto w-full text-left text-sm text-gray-700">
                        <tbody>
                            <tr className="border-b">
                                <td className="font-medium py-2">Employee ID:</td>
                                <td className="py-2">{user.employeeId || 'N/A'}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="font-medium py-2">Position:</td>
                                <td className="py-2">{user.position || 'N/A'}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="font-medium py-2">HR:</td>
                                <td className="py-2">{user.Hr || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td className="font-medium py-2">Created At:</td>
                                <td className="py-2">{new Date(user.createdAt).toLocaleDateString() || 'N/A'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Profile;