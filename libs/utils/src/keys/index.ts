import _ from "lodash";

export function getKeysFromTemplate(t: string, v: object): string {
  const template = _.template(t);
  return template(v);
}
