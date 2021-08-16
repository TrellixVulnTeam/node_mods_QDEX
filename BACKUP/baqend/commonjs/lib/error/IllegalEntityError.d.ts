import { PersistentError } from './PersistentError';
import { Entity } from '../binding';
export declare class IllegalEntityError extends PersistentError {
    /**
     * The entity which cause the error
     */
    entity: Entity;
    /**
     * @param entity - The entity which cause the error
     */
    constructor(entity: Entity);
}