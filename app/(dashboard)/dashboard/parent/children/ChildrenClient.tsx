"use client";

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  age_group: 'infant' | 'toddler' | 'preschool' | string;
  allergies: string[] | null;
  medical_notes: string | null;
  teacher_name: string | null;
  attendance_today: boolean;
  mood_today: 'happy' | 'sad' | 'tired' | 'energetic' | 'neutral' | 'fussy' | 'excited' | null;
}

export default function ChildrenClient({ childrenData }: { childrenData: Child[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('all');

  const getAgeGroupColor = (ageGroup: string) => {
    switch (ageGroup) {
      case 'infant':
        return 'bg-blue-100 text-blue-800';
      case 'toddler':
        return 'bg-green-100 text-green-800';
      case 'preschool':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMoodColor = (mood: string | null) => {
    switch (mood) {
      case 'happy':
        return 'bg-green-100 text-green-800';
      case 'sad':
        return 'bg-blue-100 text-blue-800';
      case 'tired':
        return 'bg-yellow-100 text-yellow-800';
      case 'energetic':
        return 'bg-orange-100 text-orange-800';
      case 'fussy':
        return 'bg-red-100 text-red-800';
      case 'excited':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredChildren = useMemo(() => {
    return (childrenData || []).filter((child) => {
      const matchesSearch =
        child.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.last_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterGroup === 'all' || child.age_group === filterGroup;

      return matchesSearch && matchesFilter;
    });
  }, [childrenData, searchTerm, filterGroup]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Children</h1>
          <Button asChild>
            <Link href="/dashboard/enroll">Enroll Child</Link>
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search children..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Ages</option>
            <option value="infant">Infant</option>
            <option value="toddler">Toddler</option>
            <option value="preschool">Preschool</option>
          </select>
        </div>

        {/* Children Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChildren.map((child) => (
            <Card key={child.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {child.first_name} {child.last_name}
                    </CardTitle>
                    <p className="text-gray-600">
                      Age: {new Date().getFullYear() - new Date(child.date_of_birth).getFullYear()} years old
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getAgeGroupColor(child.age_group)}>{child.age_group}</Badge>
                    {child.mood_today && (
                      <Badge className={getMoodColor(child.mood_today)}>{child.mood_today}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="font-semibold">Teacher:</Label>
                    <p className="text-gray-600">{child.teacher_name || 'Not assigned'}</p>
                  </div>

                  <div>
                    <Label className="font-semibold">Today's Status:</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-3 h-3 rounded-full ${child.attendance_today ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={child.attendance_today ? 'text-green-600' : 'text-gray-500'}>
                        {child.attendance_today ? 'Present' : 'Not checked in'}
                      </span>
                    </div>
                  </div>

                  {child.allergies && child.allergies.length > 0 && (
                    <div>
                      <Label className="font-semibold">Allergies:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {child.allergies.map((allergy, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {child.medical_notes && (
                    <div>
                      <Label className="font-semibold">Medical Notes:</Label>
                      <p className="text-gray-600 text-sm mt-1">{child.medical_notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/parent/children/${child.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredChildren.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No children enrolled.</p>
            <p className="text-gray-400 mt-2">Add your child's profile to begin tracking their daily activities.</p>
            <div className="mt-4">
              <Button asChild>
                <Link href="/dashboard/enroll">Enroll Child</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
