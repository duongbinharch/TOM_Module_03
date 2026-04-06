import * as React from 'react';
import { Project } from '../classes/Project';

interface Props {//interface is a TypeScript feature to define the shape of an object, and Props is a common name for defining props type for React components
    // Define the props type for ProjectCard component
    project: Project; // This prop will receive a Project object to display its details
}

export function ProjectCard(props: Props) {
    const iconColors = [
        '#ca8134',
        '#1f8a70',
        '#2f6fed',
        '#a44cd3',
        '#e35d5b',
        '#0f766e'
    ]

    const getRandomIconColor = (projectId: string) => {
        let hash = 0
        for (let i = 0; i < projectId.length; i++) {
            hash = (hash << 5) - hash + projectId.charCodeAt(i)
            hash |= 0
        }
        return iconColors[Math.abs(hash) % iconColors.length]
    }

    const iconText = props.project.name.trim().slice(0, 2) || 'NA'

    return (
        <div className="project-card">
            <div className="card-header">
                <p
                className="project-icon"
                style={{
                    backgroundColor: getRandomIconColor(props.project.id)
                }}
                >
                {iconText}
                </p>
                <div>
                    <h5>{props.project.name}</h5>
                    <p>{props.project.description}</p>
                </div>
            </div>
            <div className="card-content">
                <div className="card-property">
                <p style={{ color: "#969696" }}>Status</p>
                <p>{props.project.status}</p>
                </div>
                <div className="card-property">
                <p style={{ color: "#969696" }}>Role</p>
                <p>{props.project.userRole}</p>
                </div>
                <div className="card-property">
                <p style={{ color: "#969696" }}>Cost</p>
                <p>$ {props.project.cost}</p>
                </div>
                <div className="card-property">
                <p style={{ color: "#969696" }}>Estimated Progress</p>
                <p>{props.project.progress} %</p>
                </div>
            </div>
        </div>
    )
}