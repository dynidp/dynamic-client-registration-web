import React from "react";
import {Collapse, Icon, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader} from "@mui/material";

import NotificationListItem from "./NotificationListItem";
import {NotificationResponseItem} from "../machines/notificationsMachine";
import {ExpandLess, ExpandMore, StarBorder} from "@mui/icons-material";
import {AnyRecord} from "../models";

export interface NotificationsListProps {
    notifications: NotificationResponseItem[];
    updateNotification: Function;
}

const NotificationsList: React.FC<NotificationsListProps> = ({
                                                                 notifications,
                                                                 updateNotification,
                                                             }) => {

    const notificationsGroup = groupBy(notifications, 'group');

    return (
        <>
            {notifications?.length > 0 ? (
                <List data-test="notifications-list"
                      sx={{
                          width: '100%',
                          maxWidth: 360,
                          position: 'relative',
                          overflow: 'auto',
                          
                          '& ul': {padding: 0},
                      }}
                      subheader={<li/>}

                >
                    {notificationsGroup['default'] && notificationsGroup['default'].map((notification: NotificationResponseItem) => (
                        <NotificationListItem
                            key={notification.id}
                            notification={notification}
                            updateNotification={updateNotification}
                        />
                    ))}

                    {
                        Object.keys(notificationsGroup).filter(g => g !== 'default')
                            .map(group => (
                                <NotificationsGroup notifications={notificationsGroup[group]} 
                                                    key={group}
                                                    group={group}
                                                    updateNotification={updateNotification}
                                                    icon={notificationsGroup[group][0].icon}/>
                            ))
                    }
                </List>
            ) : (
                <></>
            )}
        </>
    );
};
const groupBy = (input: AnyRecord[], key: string) => {
    return input.reduce((acc, currentValue) => {
        let groupKey = currentValue[key] || 'default';
        if (!acc[groupKey]) {
            acc[groupKey] = [];
        }
        acc[groupKey].push(currentValue);
        return acc;
    }, {});
};

export interface NotificationsGroupProps {
    group: string,
    icon: string,
    notifications: NotificationResponseItem[];
    updateNotification: Function;
}

const NotificationsGroup: React.FC<NotificationsGroupProps> = ({
                                                                  group,
                                                                  icon,
                                                                  notifications,
                                                                  updateNotification,
                                                              }) => {
    const [open, setOpen] = React.useState(true);

    const handleClick = () => {
        setOpen(!open);
    };

    return (
        <div>
            <ListSubheader component={ListItemButton} onClick={handleClick}>
                <ListItemIcon>
                    <Icon baseClassName="material-icons material-icons-outlined">{icon}</Icon>
                </ListItemIcon>
                
               <ListItemIcon>{group}</ListItemIcon>
                 
            </ListSubheader>
          

            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    {notifications.map((notification) => (
                        <NotificationListItem
                            sx={{pl: 4}}
                            key={notification.id}
                            notification={notification}
                            updateNotification={updateNotification}
                        />
                    ))}

                </List>
            </Collapse>
        </div>
    );
};


export default NotificationsList;
