'use client';

import { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Ttune } from '../subtuneTypes/Tune';


interface EditState {
    id: string;  // 'new' for new items, actual ID for existing ones
    title: string;
    description: string;
    color: string;
    image: string | null;
    tunes: Ttune[];
}

interface PageSnapshot {
    formState: {
        title: string;
        description: string;
        color: string;
        image: string | null;
        tunes: Ttune[];
    };
    visualState: {
        colorRGBA: number[];
        backgroundImage: string | null;
    };
}

interface EditContextType {
    // Core edit state
    currentState: EditState;
    currentEditId: string | null;
    editMode: 'playlist' | 'subtune' | null;
    preEditSnapshot: EditState | null;
    
    // Container refresh functionality
    containerRefreshFns: Map<string, () => Promise<void>>;
    registerContainer: (containerId: string, refreshFn: () => Promise<void>) => void;
    refreshContainer: (containerId: string) => Promise<void>;
    
    // Tab refresh functionality
    refreshList: (type: 'subtune' | 'playlist') => void;
    listRefreshTrigger: number;
    
    // Core actions
    startEdit: (mode: 'playlist' | 'subtune', id: string, state: EditState) => void;
    clearEdit: () => Promise<void>;
    updateCurrentState: (updates: Partial<EditState>) => void;
    
    // New selectedTab state
    selectedTab: 'playlist' | 'subtune';
    setSelectedTab: React.Dispatch<React.SetStateAction<'playlist' | 'subtune'>>;
}

const EditContext = createContext<EditContextType | undefined>(undefined);

export function EditProvider({ children }: { children: React.ReactNode }) {
    // Core state with localStorage initialization
    const [currentState, setCurrentState] = useState<EditState>(() => {
        const cached = localStorage.getItem('edit_current_state');
        return cached ? JSON.parse(cached) : {
            id: 'new',  // Default to 'new'
            title: '',
            description: '',
            color: '',
            image: null,
            tunes: []
        };
    });

    // Also restore edit state from cache
    const [currentEditId, setCurrentEditId] = useState<string | null>(() => {
        const cached = localStorage.getItem('edit_info');
        return cached ? JSON.parse(cached).id : null;
    });

    const [editMode, setEditMode] = useState<'playlist' | 'subtune' | null>(() => {
        const cached = localStorage.getItem('edit_info');
        return cached ? JSON.parse(cached).mode : null;
    });

    const [preEditSnapshot, setPreEditSnapshot] = useState<EditState | null>(() => {
        const cached = localStorage.getItem('edit_snapshot');
        return cached ? JSON.parse(cached) : null;
    });

    // Cache updates
    useEffect(() => {
        localStorage.setItem('edit_current_state', JSON.stringify(currentState));
    }, [currentState]);

    useEffect(() => {
        if (currentEditId && editMode) {
            localStorage.setItem('edit_info', JSON.stringify({ id: currentEditId, mode: editMode }));
        } else {
            localStorage.removeItem('edit_info');
        }
    }, [currentEditId, editMode]);

    useEffect(() => {
        if (preEditSnapshot) {
            localStorage.setItem('edit_snapshot', JSON.stringify(preEditSnapshot));
        } else {
            localStorage.removeItem('edit_snapshot');
        }
    }, [preEditSnapshot]);

    // Refresh functionality
    const [containerRefreshFns] = useState<Map<string, () => Promise<void>>>(new Map());
    const [listRefreshTrigger, setListRefreshTrigger] = useState(0);

    // Container management
    const registerContainer = (containerId: string, refreshFn: () => Promise<void>) => {
        containerRefreshFns.set(containerId, refreshFn);
    };

    const refreshContainer = async (containerId: string) => {
        const refreshFn = containerRefreshFns.get(containerId);
        if (refreshFn) {
            await refreshFn();
        }
    };

    // Tab refresh
    const refreshList = (type: 'subtune' | 'playlist') => {
        setListRefreshTrigger(prev => prev + 1);
    };

    // Core actions
    const startEdit = (mode: 'playlist' | 'subtune', id: string, state: EditState) => {
        console.log('Starting edit, saving current state as snapshot:', currentState);

        // Check if already in edit mode, so as to not overwrite 'new' state
        if (!editMode) {
            // Save 'new' current state as snapshot before starting edit
            setPreEditSnapshot(currentState);
        }

        // Update to new edit state
        setCurrentState({
            ...state,
            id
        });
        setCurrentEditId(id);
        setEditMode(mode);
    };

    const clearEdit = async () => {
        if (preEditSnapshot) {
            // Clear edit state first so DDContainer stops syncing
            setEditMode(null);
            setCurrentEditId(null);
            setPreEditSnapshot(null);
            
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // Then restore middle panel state
            setCurrentState(preEditSnapshot);
        }
    };

    const updateCurrentState = (updates: Partial<EditState>) => {
        setCurrentState(current => ({ ...current, ...updates }));
    };

    // Add selectedTab state
    const [selectedTab, setSelectedTab] = useState<'playlist' | 'subtune'>('subtune');

    return (
        <EditContext.Provider value={{
            currentState,
            currentEditId,
            editMode,
            preEditSnapshot,
            containerRefreshFns,
            registerContainer,
            refreshContainer,
            refreshList,
            listRefreshTrigger,
            startEdit,
            clearEdit,
            updateCurrentState,
            selectedTab,
            setSelectedTab
        }}>
            {children}
        </EditContext.Provider>
    );
}

export const useEdit = () => {
    const context = useContext(EditContext);
    if (context === undefined) {
        throw new Error('useEdit must be used within an EditProvider');
    }
    return context;
}; 