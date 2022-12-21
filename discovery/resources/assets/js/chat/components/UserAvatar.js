import React from 'react';

const UserAvatar = ({avatar}) => <div className="user-avatar"
                                      style={avatar ? {
                                          backgroundImage: `url('${avatar}')`,
                                          backgroundColor: 'transparent'
                                      } : null}
/>;

export default UserAvatar;