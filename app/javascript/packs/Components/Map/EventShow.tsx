import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRideContext } from '../../Rides/Ride';
import { useAppContext } from '../../Context';
import axios from '../../../lib/axios';
import { DateTime } from 'luxon';
import { camelize } from '../../../lib/camelize';
import QuillEditor from '../Quill/QuillEditor';
import QuillDisplay from '../Quill/QuillDisplay';
import Avatar from '../Avatar';
import Modal from '../Modal/Modal';
import FacebookShareButton from '../FaceBook/ShareButton';
import { stringIsValidQuillDelta } from '../Quill/quillHelpers';
import { debounce } from 'lodash';
import { Map } from 'mapbox-gl';

const EventShow = () => {
  const { title } = useRideContext();
  const ref = useRef<HTMLDivElement>();
  const createdRef = useRef(false);
  const appCtx = useAppContext();
  const { currentUser, ride } = appCtx.controllerData;
  const [participants, setParticipants] = useState(
    appCtx?.controllerData?.participants ? appCtx.controllerData.participants : []
  );
  const [comments, setComments] = useState(appCtx.controllerData?.comments ? appCtx.controllerData.comments : []);
  const [comment, setComment] = useState('');
  const [editorBlank, setEditorBlank] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [currentUserIsParticipant, setCurrentUserIsParticipant] = useState(
    !!participants.find((p) => p.userId === currentUser?.id)
  );
  const [joinButtonDisabled, setJoinButtonDisabled] = useState(currentUserIsParticipant);
  const joinRide = async () => {
    if (!currentUser?.id) return alert('You must be signed in to join a ride');
    setJoinButtonDisabled(true);
    const res = await axios.post('/participate', {
      user_id: currentUser.id,
      ride_id: ride.id,
    });
    if (res?.data?.success) {
      setParticipants(camelize(res.data.participants));
      setCurrentUserIsParticipant(true);
    } else {
      alert('Something went wrong. Please try again later.');
      setJoinButtonDisabled(false);
    }
  };

  const addComment = async () => {
    if (!stringIsValidQuillDelta(comment)) return;
    if (!currentUser?.id) return alert('Please sign in to add a comment.');
    setEditorBlank(true);
    const res = await axios.post(`/rides/${ride.id}/comments`, { content: comment, user_id: currentUser.id });
    if (res.data.success) {
      return setComments(camelize(res.data.comments));
    }
    alert('There was a problem saving your comment. Please try again later.');
  };

  useEffect(() => {
    if ((window.ResizeObserver && !ref.current) || createdRef.current) return;
    createdRef.current = true;
    new ResizeObserver(
      debounce(() => {
        const map = window.mapboxMap as Map;
        map.resize();
      }, 500)
    ).observe(ref.current);
  }, [ref]);

  return (
    <div className='EventShow' style={{ resize: window.ResizeObserver ? 'horizontal' : 'none' }} ref={ref}>
      {showParticipantsModal && (
        <Modal onClose={() => setShowParticipantsModal(false)}>
          <div className='participants-modal'>
            <ul>
              {participants.map((p) => (
                <li key={p.userId}>
                  <a href={`/profiles/${p.userId}`}>{p.username}</a>
                  <Avatar avatarPath={p.avatar} />
                </li>
              ))}
            </ul>
          </div>
        </Modal>
      )}
      <div className='details-top'>
        <div className='ride-details'>
          <h1 style={{ margin: 0 }}>{title}</h1>
          <h3 style={{ margin: 0 }}>{DateTime.fromISO(ride.startTime).toLocaleString(DateTime.DATETIME_MED)}</h3>
          <p title={ride.description}>{ride.description}</p>
          {!currentUserIsParticipant && (
            <button onClick={joinRide} disabled={joinButtonDisabled}>
              Join Ride
            </button>
          )}
          <div style={{ marginTop: '8px' }}>
            <FacebookShareButton />
          </div>
        </div>
        <div className='participants-list' title='Participants'>
          <h3>Participants ({participants.length})</h3>
          <ul>
            {participants?.slice(0, 9).map((p) => (
              <li key={p.userId}>
                <a href={`/profiles/${p.userId}`}>{p.username}</a>
                <Avatar avatarPath={p.avatar} />
              </li>
            ))}
            {participants?.length > 9 ? (
              <li>
                {participants.length === 10 ? (
                  <>
                    <a href={`/profiles/${participants[9].userId}`}>{participants[9].username}</a>
                    <Avatar avatarPath={participants[9].avatar} />
                  </>
                ) : (
                  <>
                    <a onClick={() => setShowParticipantsModal(true)}>See {participants.length - 9} more riders...</a>
                    <Avatar avatarPath={null} />
                  </>
                )}
              </li>
            ) : (
              <></>
            )}
          </ul>
        </div>
      </div>
      <div className='event-comments'>
        {comments.map((comment) => {
          const commentDate = DateTime.fromISO(comment.createdAt).toLocaleString(DateTime.DATETIME_MED);
          return (
            <div className='comment' key={comment.id}>
              <div className='comment-user'>
                <a href={`/profiles/${comment.userId}`}>{comment.username}</a>
                <Avatar avatarPath={comment.avatar} />
              </div>
              <div className='comment-right'>
                <div className='comment-top'>
                  <p>{commentDate}</p>
                </div>
                <QuillDisplay delta={JSON.parse(comment.content)} />
              </div>
            </div>
          );
        })}
      </div>
      <div className='comment'>
        <div className='comment-right'>
          <div style={{ margin: '4px 8px' }}>
            <QuillEditor setDelta={setComment} editorBlank={editorBlank} />
            <button onClick={addComment} disabled={!stringIsValidQuillDelta(comment)} className='post-button'>
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventShow;
