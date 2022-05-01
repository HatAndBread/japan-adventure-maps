import React from 'react';
import { useAppContext } from '../Context';
import Avatar from '../Components/Avatar';
import QuillDisplay from '../Components/Quill/QuillDisplay';
import Delta from 'quill-delta';
import { DateTime } from 'luxon';
import RouteList from './RouteList';

const ProfileShow = () => {
  const data = useAppContext().controllerData;
  const profileData = data.profileBeingViewed;
  return (
    <div className='ProfileShow'>
      {profileData.userId === data.currentUser?.id && (
        <div
          className='edit-icon-container'
          onClick={() => (window.location.href = `/profiles/${data.currentUser.id}/edit`)}>
          <i className='fas fa-edit'></i>
        </div>
      )}
      <div className='profile-top'>
        <div className='stats-avatar card'>
          <h1>{data.profileUser.username}</h1>
          <Avatar avatarPath={profileData.avatar} width={200} height={200} />
        </div>
        {profileData.intro && profileData.intro?.length > 25 && (
          <div className='intro-container card'>
            <QuillDisplay delta={new Delta(JSON.parse(profileData.intro))} />
          </div>
        )}
      </div>
      <div className='ride-index'>
        <RouteList
          title='My Routes'
          routes={data.routes}
          belongsToCurrentUser={data.currentUser?.id === profileData.userId}
        />
      </div>
    </div>
  );
};

export default ProfileShow;
