import { User, Clock, Check, X } from 'lucide-react';

export const ContactItem = ({ 
  user, 
  type = 'contact', 
  requestId, 
  onAccept, 
  onReject,
  onRemove 
}) => {
  const getStatusBadge = () => {
    switch (type) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </span>
        );
      case 'received':
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => onAccept(requestId)}
              className="inline-flex items-center p-1 text-green-600 rounded-full hover:bg-green-100"
              title="Accept"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => onReject(requestId)}
              className="p-1 text-red-600 rounded-full hover:bg-red-100"
              title="Reject"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-3 transition-colors duration-200 hover:bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="relative">
          {user.profilePic ? (
            <img
              src={user.profilePic}
              alt={user.username || user.email}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600">
              <User className="w-5 h-5" />
            </div>
          )}
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900">
            {user.username || user.email}
          </h4>
          {user.fullName && (
            <p className="text-xs text-gray-500">{user.fullName}</p>
          )}
        </div>
      </div>
      {getStatusBadge()}
    </div>
  );
};

export default ContactItem;
