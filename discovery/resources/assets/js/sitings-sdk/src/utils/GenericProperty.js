/**
 * Base class for properties
 */
export default class GenericProperty
{
    private var _change:Subscription;

    constructor(name)
    {
        _change = new Subscription(name);
    }

    public function cleanup():void
    {
        if (_change)
        {
            _change.cleanup();
            _change = null;
        }
    }

    public function get change():Subscription
    {
        return _change;
    }
}