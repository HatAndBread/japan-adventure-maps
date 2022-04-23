import React, { ReactChildren } from 'react';

const Modal = ({ children, onClose }: { children: any; onClose?: () => any }) => {
  return (
    <div
      className='Modal'
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(100, 100, 100, 0.5)',
        zIndex: 1000,
        pointerEvents: 'all',
      }}>
      <div
        className='modal-content-container'
        style={{
          backgroundColor: 'snow',
          padding: '16px 24px',
          borderRadius: '8px',
          position: 'absolute',
        }}>
        <div className='closer-container'>
          <div onClick={onClose ? onClose : () => {}}>
            <i className='fas fa-times pointer'></i>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
