import React from 'react';
import { Card } from 'react-bootstrap';
import { FaDoorOpen, FaCalendarTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { MonitorCardType } from '../../shared/types';

type MonitorCardProps = {
    monitor: MonitorCardType
}

export function MonitorCard({monitor}: MonitorCardProps) {
    const {url, active, id, start, end} = monitor;
    return (
        <div className='cards-wrapper'>
            <Card>
                <Card.Header>
                    <div className='header'>
                        <p>{url}</p>
                        {
                            active ?
                                <Link to={`/room/:${id}`}>
                                    <FaDoorOpen style={{ fill: 'rgb(49, 211, 49)' }} size={30}></FaDoorOpen>
                                </Link>
                                :
                                <FaCalendarTimes style={{ fill: 'rgb(197, 37, 37)' }} size={30}></FaCalendarTimes>
                        }
                    </div>

                    <div className="dates">
                        <span>
                            {start.slice(0, - 3)}
                        </span>
                        <span className="delimilator">
                            -
                        </span>
                        <span>
                            {end.slice(0, -3)}
                        </span>
                    </div>
                </Card.Header>
            </Card>
        </div>
    )
}