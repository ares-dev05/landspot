package com.mihai.shared
{

    /**
     * Property holding Number value and publishing changes to it.
     */
    public class NumberProperty extends GenericProperty
    {
        private var _value:Number;
        
        public function NumberProperty(name : String, value:Number)
        {
            super(name);
            _value = value;
        }

        public function get value():Number
        {
            return _value;
        }

        public function set value(newValue:Number):void
        {
            if (_value != newValue && change)
            {
                var oldValue:Number = _value;
                _value = newValue;
                change.publish(oldValue, newValue);
            }
        }
    }
}
