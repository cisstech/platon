import { inject, TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        StorageService,
      ]
    });
  });

  it('should be created', inject([StorageService], async (service: StorageService) => {
    expect(service).toBeTruthy();
    await service.clear().toPromise();
  }));

  it('should set and get string', inject([StorageService], async (service: StorageService) => {
    const key = 'strKey';
    const value = 'strValue';
    await service.remove(key).toPromise();
    await service.set(key, value).toPromise();
    expect(await service.getString(key).toPromise()).toBe(value);
    await service.remove(key).toPromise();
    expect(await service.getString(key).toPromise()).toBeUndefined();
    expect(await service.getString(key, 'val').toPromise()).toBe('val');
  }));

  it('should set and get boolean', inject([StorageService], async (service: StorageService) => {
    const key = 'boolKey';
    const value = false;
    await service.remove(key).toPromise();
    await service.set(key, value).toPromise();
    expect(await service.getBoolean(key).toPromise()).toBe(value);
  }));

  it('should set and get number', inject([StorageService], async (service: StorageService) => {
    const key = 'numberKey';
    const value = 42;
    await service.remove(key).toPromise();
    await service.set(key, value).toPromise();
    expect(await service.getNumber(key).toPromise()).toBe(value);
  }));

  it('should set and get item', inject([StorageService], async (service: StorageService) => {
    const key = 'strKey';
    const value = {value: 'strValue'};
    await service.remove(key).toPromise();
    await service.set(key, value).toPromise();
    expect(await service.get(key).toPromise()).toEqual(value);
    await service.remove(key).toPromise();
    expect(await service.get(key).toPromise()).toBeUndefined();
    expect(await service.get(key, {value: 'default'}).toPromise()).toEqual({value: 'default'});
  }));
});
