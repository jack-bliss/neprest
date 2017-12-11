
export class NepGetRequest<T> {
  
  constructor(input: Partial<NepGetRequest<T>>) {
    Object.assign(this, input);
  }
  
  select: string[];
  where?: string;
  orderBy?: string;
  prep: (a: any) => T;
}

export class NepPostRequest<T> {
  
  constructor(input: Partial<NepPostRequest<T>>) {
    Object.assign(this, input);
  }
  
  insert: T;
  returning: string;
  prep: (a: any) => T;
}

export class NepPutRequest<T> {
  
  constructor(input: Partial<NepPutRequest<T>>) {
    Object.assign(this, input);
  }
  
  set: string[];
  where: string;
  prep: (a: any) => T;
}

export class NepDeleteRequest<T> {
  
  constructor(input: Partial<NepDeleteRequest<T>>) {
    Object.assign(this, input);
  }
  
  where: string;
  prep: (a: any) => T;
  
}

export class NepCustomRequest<T> {
  
  constructor(input: Partial<NepCustomRequest<T>>) {
    Object.assign(this, input);
  }
  
  query: string;
  prep: (a: any) => T;
}