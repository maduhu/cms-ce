package com.enonic.cms.liveportaltrace.geolocation;


public class IpInfoDbResponse
{

    private String statusCode;

    private String statusMessage;

    private String ipAddress;

    private String countryCode;

    private String countryName;

    private String regionName;

    private String cityName;

    private String zipCode;

    private double latitude;

    private double longitude;

    private String timezone;


    public IpInfoDbResponse()
    {

    }

    public String getStatusCode()
    {
        return statusCode;
    }

    public void setStatusCode( String statusCode )
    {
        this.statusCode = statusCode;
    }

    public String getStatusMessage()
    {
        return statusMessage;
    }

    public void setStatusMessage( String statusMessage )
    {
        this.statusMessage = statusMessage;
    }

    public String getIpAddress()
    {
        return ipAddress;
    }

    public void setIpAddress( String ipAddress )
    {
        this.ipAddress = ipAddress;
    }

    public String getCountryCode()
    {
        return countryCode;
    }

    public void setCountryCode( String countryCode )
    {
        this.countryCode = countryCode;
    }

    public String getCountryName()
    {
        return countryName;
    }

    public void setCountryName( String countryName )
    {
        this.countryName = countryName;
    }

    public String getRegionName()
    {
        return regionName;
    }

    public void setRegionName( String regionName )
    {
        this.regionName = regionName;
    }

    public String getCityName()
    {
        return cityName;
    }

    public void setCityName( String cityName )
    {
        this.cityName = cityName;
    }

    public String getZipCode()
    {
        return zipCode;
    }

    public void setZipCode( String zipCode )
    {
        this.zipCode = zipCode;
    }

    public double getLatitude()
    {
        return latitude;
    }

    public void setLatitude( double latitude )
    {
        this.latitude = latitude;
    }

    public double getLongitude()
    {
        return longitude;
    }

    public void setLongitude( double longitude )
    {
        this.longitude = longitude;
    }

    public String getTimezone()
    {
        return timezone;
    }

    public void setTimezone( String timezone )
    {
        this.timezone = timezone;
    }

    @Override
    public String toString()
    {
        final StringBuilder sb = new StringBuilder();
        sb.append( "LocationInfo" );
        sb.append( "{statusCode='" ).append( statusCode ).append( '\'' );
        sb.append( ", statusMessage='" ).append( statusMessage ).append( '\'' );
        sb.append( ", ipAddress='" ).append( ipAddress ).append( '\'' );
        sb.append( ", countryCode='" ).append( countryCode ).append( '\'' );
        sb.append( ", countryName='" ).append( countryName ).append( '\'' );
        sb.append( ", regionName='" ).append( regionName ).append( '\'' );
        sb.append( ", cityName='" ).append( cityName ).append( '\'' );
        sb.append( ", zipCode='" ).append( zipCode ).append( '\'' );
        sb.append( ", latitude=" ).append( latitude );
        sb.append( ", longitude=" ).append( longitude );
        sb.append( ", timezone='" ).append( timezone ).append( '\'' );
        sb.append( '}' );
        return sb.toString();
    }
}
