
export class NepGetRequest<T> {
  
  constructor(input: Partial<NepGetRequest<T>>) {
    Object.assign(this, input);
  }
  
  select: (keyof T)[] | '*';
  where?: string;
  orderBy?: string;
  prep?: (a: T[]) => any;
}

export class NepPostRequest<T> {
  
  constructor(input: Partial<NepPostRequest<T>>) {
    Object.assign(this, input);
  }
  
  insert: T;
  prep?: (a: T) => any;
}

export class NepPutRequest<T> {
  
  constructor(input: Partial<NepPutRequest<T>>) {
    Object.assign(this, input);
  }
  
  set: T;
  where: string;
  prep?: (a: T) => any;
}

export class NepDeleteRequest<T> {
  
  constructor(input: Partial<NepDeleteRequest<T>>) {
    Object.assign(this, input);
  }
  
  where: string;
  prep?: (a: any) => any;
  
}

export class NepCustomRequest<T> {
  
  constructor(input: Partial<NepCustomRequest<T>>) {
    Object.assign(this, input);
  }
  
  query: string;
  prep?: (a: any) => any;
}