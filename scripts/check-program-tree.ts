import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {projectRecords,programsInHead} from '../src/lib/programTree.ts';
import type {Razdjel} from '../src/lib/types.ts';
const data:Razdjel[]=JSON.parse(readFileSync(new URL('../public/data/programska.json',import.meta.url),'utf8'));
const records=projectRecords(data);
assert.equal(new Set(records.map(r=>r.url)).size,records.length);
for(const record of records){
 const params=new URL(record.url,'http://localhost').searchParams;
 const department=data[Number(params.get('r'))];
 const head=department.glave[Number(params.get('g'))];
 const program=programsInHead(head)[Number(params.get('p'))];
 assert.equal(program.program.aktivnosti[Number(params.get('a'))],record.activity);
}
console.log(`Verified ${records.length} unique deep links to activities and projects.`);
